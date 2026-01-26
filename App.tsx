
import { useState, useEffect, useCallback } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { PreviewPage2 } from './components/PreviewPage2';
import { INITIAL_DATA } from './constants';
import { StudentData } from './types';
import { Printer, RotateCcw, Settings, X, Save, Copy, Check, Eye, EyeOff, Loader2, Search, ExternalLink } from 'lucide-react';

/**
 * Utility to convert Google Drive "Viewer" or "UC" links into "Direct Stream" links.
 * Using lh3.googleusercontent.com/d/[ID] is the most reliable way to embed Drive images.
 */
const fixDriveUrl = (url: string) => {
  if (!url || (!url.includes('drive.google.com') && !url.includes('googleusercontent.com'))) return url;
  
  // Regex to find ID in any of these common formats:
  // /file/d/[ID]/view
  // /uc?id=[ID]
  // /d/[ID]
  const match = url.match(/\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  if (match && match[1]) {
    // This is the most robust direct-embed endpoint for shared Drive files
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url;
};

const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  var request = JSON.parse(e.postData.contents);
  var action = request.action;
  var data = request.data;
  
  if (action === 'save') {
    return saveToDrive(data);
  } else if (action === 'list') {
    return listStudents(request.grade, request.section);
  } else if (action === 'load') {
    return loadStudent(request.fileId);
  }
}

function getFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(name);
}

function saveToDrive(data) {
  var folderName = (data.grade || "Unsorted") + (data.section || "");
  var folder = getFolder(folderName);
  
  function saveImage(base64Data, type) {
    if (!base64Data || !base64Data.includes("base64,")) {
      if (base64Data && base64Data.startsWith("http")) return base64Data;
      return "";
    }
    try {
      var splitData = base64Data.split("base64,");
      var contentType = splitData[0].split(":")[1].split(";")[0];
      var bytes = Utilities.base64Decode(splitData[1]);
      var fileName = data.studentName.replace(/[^a-z0-9]/gi, '_') + "_" + type + ".png";
      
      var existing = folder.getFilesByName(fileName);
      while(existing.hasNext()) existing.next().setTrashed(true);
      
      var file = folder.createFile(Utilities.newBlob(bytes, contentType, fileName));
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      // Return the most robust embedding URL format
      return "https://lh3.googleusercontent.com/d/" + file.getId();
    } catch (err) { return ""; }
  }

  data.photoUrl = saveImage(data.photoUrl, "Student");
  data.mePhotoUrl = saveImage(data.mePhotoUrl, "Me");
  data.familyPhotoUrl = saveImage(data.familyPhotoUrl, "Family");

  var jsonFileName = data.studentName.replace(/[^a-z0-9]/gi, '_') + ".json";
  var existingJson = folder.getFilesByName(jsonFileName);
  while(existingJson.hasNext()) existingJson.next().setTrashed(true);
  
  var jsonFile = folder.createFile(jsonFileName, JSON.stringify(data), MimeType.PLAIN_TEXT);
  jsonFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return ContentService.createTextOutput(JSON.stringify({
    "result": "success", 
    "message": "Saved successfully!"
  })).setMimeType(ContentService.MimeType.JSON);
}

function listStudents(grade, section) {
  var folderName = grade + section;
  var folders = DriveApp.getFoldersByName(folderName);
  if (!folders.hasNext()) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  var folder = folders.next();
  var files = folder.getFilesByType(MimeType.PLAIN_TEXT);
  var list = [];
  while(files.hasNext()) {
    var file = files.next();
    if (file.getName().endsWith(".json")) {
      list.push({ id: file.getId(), name: file.getName().replace(".json", "").replace(/_/g, " ") });
    }
  }
  return ContentService.createTextOutput(JSON.stringify(list)).setMimeType(ContentService.MimeType.JSON);
}

function loadStudent(fileId) {
  var file = DriveApp.getFileById(fileId);
  return ContentService.createTextOutput(file.getBlob().getDataAsString()).setMimeType(ContentService.MimeType.JSON);
}`;

export default function App() {
  const [data, setData] = useState<StudentData>(INITIAL_DATA);
  const [scriptUrl, setScriptUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [studentList, setStudentList] = useState<{ id: string, name: string }[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem('hpc_script_url');
    if (savedUrl) setScriptUrl(savedUrl);
  }, []);

  const fetchStudentList = useCallback(async (grade: string, section: string) => {
    if (!scriptUrl || !grade || !section) return;
    setIsLoadingList(true);
    try {
      const resp = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'list', grade, section }),
      });
      const list = await resp.json();
      setStudentList(list);
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'Connection failed. Check Script URL.' });
    } finally {
      setIsLoadingList(false);
    }
  }, [scriptUrl]);

  const loadStudentData = async (fileId: string) => {
    if (!scriptUrl || !fileId) return;
    setIsLoadingRecord(true);
    try {
      const resp = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'load', fileId }),
      });
      const rawData = await resp.json();
      
      // AUTO-FIX IMAGE URLS ON LOAD TO THE MOST ROBUST FORMAT
      const fixedData = {
        ...rawData,
        photoUrl: fixDriveUrl(rawData.photoUrl),
        mePhotoUrl: fixDriveUrl(rawData.mePhotoUrl),
        familyPhotoUrl: fixDriveUrl(rawData.familyPhotoUrl)
      };
      
      setData(fixedData);
      setStatusMsg({ type: 'success', text: `Loaded ${fixedData.studentName}` });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'Failed to load record.' });
    } finally {
      setIsLoadingRecord(false);
    }
  };

  const handleSaveToDrive = async () => {
    if (!scriptUrl) { setShowSettings(true); return; }
    if (!data.studentName || !data.grade || !data.section) {
      setStatusMsg({ type: 'error', text: 'Required: Name, Grade, Section' });
      return;
    }
    setIsSaving(true);
    try {
      // Ensure we are saving the "fixed" URLs for future consistency
      const dataToSave = {
        ...data,
        photoUrl: fixDriveUrl(data.photoUrl),
        mePhotoUrl: fixDriveUrl(data.mePhotoUrl),
        familyPhotoUrl: fixDriveUrl(data.familyPhotoUrl)
      };

      const response = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'save', data: dataToSave }),
      });
      const result = await response.json();
      if (result.result === 'success') {
        setStatusMsg({ type: 'success', text: 'Saved to Drive successfully!' });
        fetchStudentList(data.grade, data.section);
      }
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (error) {
      setStatusMsg({ type: 'error', text: 'Save failed. Check script permissions.' });
    } finally { setIsSaving(false); }
  };

  const saveSettings = () => {
    localStorage.setItem('hpc_script_url', scriptUrl);
    setShowSettings(false);
    setStatusMsg({ type: 'success', text: 'Settings saved!' });
    setTimeout(() => setStatusMsg(null), 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-white shadow-sm p-4 print:hidden sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">HPC JSON Generator</h1>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">V3.3 - Robust Image Fix</span>
          </div>
          {statusMsg && (
            <div className={`px-4 py-2 rounded text-sm font-bold shadow-sm transition-all ${statusMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {statusMsg.text}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button onClick={() => setShowPreview(!showPreview)} className="px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50 flex items-center gap-2">
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />} {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded border bg-white shadow-sm" title="Setup Backend"><Settings size={18} /></button>
            <button onClick={handleSaveToDrive} disabled={isSaving} className={`flex items-center gap-2 px-4 py-2 text-sm font-black text-white rounded shadow-md ${isSaving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {isSaving ? 'Saving...' : 'Save to Drive'}
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded shadow-md hover:bg-blue-700">
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1600px] mx-auto w-full bg-gray-200/50">
        <div className={`p-4 lg:h-[calc(100vh-80px)] overflow-hidden print:hidden flex-shrink-0 transition-all ${showPreview ? 'w-full lg:w-[480px]' : 'w-full'}`}>
          <div className="bg-white shadow-lg rounded-lg mb-4 p-4 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm uppercase"><Search size={18} /> Load Records</div>
              <button onClick={() => fetchStudentList(data.grade, data.section)} disabled={isLoadingList || !data.grade} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Refresh</button>
            </div>
            <select onChange={(e) => loadStudentData(e.target.value)} disabled={isLoadingRecord || studentList.length === 0} className="w-full border rounded-lg p-2 text-sm bg-indigo-50/30 border-indigo-100 outline-none focus:border-indigo-400" value="">
              <option value="">{studentList.length > 0 ? `Select from ${studentList.length} students` : 'Enter Grade/Section to search...'}</option>
              {studentList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Editor data={data} onChange={setData} />
        </div>

        {showPreview && (
          <div className="flex-1 bg-gray-400/20 p-4 lg:h-[calc(100vh-80px)] overflow-auto flex flex-col items-center gap-12 print:p-0 print:bg-white print:block">
             <div className="origin-top shadow-2xl print:shadow-none">
               <Preview data={data} />
             </div>
             <div className="origin-top shadow-2xl print:shadow-none mb-12">
               <PreviewPage2 data={data} />
             </div>
          </div>
        )}
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-black text-gray-800">Direct Link Setup</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ensures images load correctly in browser</p>
              </div>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Google Apps Script URL</label>
                <input type="text" placeholder="https://script.google.com/macros/s/.../exec" className="w-full border-2 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all" value={scriptUrl} onChange={(e) => setScriptUrl(e.target.value)} />
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-blue-800 text-sm uppercase">Quick Deployment Fix</h3>
                  <a href="https://script.google.com/" target="_blank" className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors shadow-sm">Open Apps Script</a>
                </div>
                <p className="text-xs text-blue-900 mb-4 font-bold">This new script uses the 'lh3.googleusercontent.com' format which prevents the redirect issues you are seeing.</p>
                <ol className="text-xs text-blue-900 space-y-2 list-decimal ml-4 font-medium">
                  <li>Copy the script code below.</li>
                  <li>In your Google Script, replace all code with this version.</li>
                  <li><strong>IMPORTANT:</strong> Click <strong>Deploy > New Deployment</strong>.</li>
                  <li>Set Access to <strong>"Anyone"</strong> and Execute as <strong>"Me"</strong>.</li>
                  <li>Copy and paste the <strong>new</strong> URL above.</li>
                </ol>
              </div>
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Script Backend (V3.3)</span>
                    <button onClick={copyToClipboard} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-black shadow-md hover:bg-blue-700 transition-all">{copied ? 'COPIED!' : 'COPY CODE'}</button>
                </div>
                <pre className="bg-gray-900 text-gray-300 p-5 rounded-xl text-[10px] overflow-x-auto border-4 border-gray-800 font-mono leading-relaxed max-h-[250px]">{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowSettings(false)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Dismiss</button>
              <button onClick={saveSettings} className="px-8 py-2 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Save & Connect</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          #print-area, #print-area-page-2 { page-break-after: always; display: block !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
          header, .print-hidden, .bg-gray-100 { display: none !important; }
          main { background: white !important; display: block !important; padding: 0 !important; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}

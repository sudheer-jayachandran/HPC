
import { useState, useEffect, useCallback } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { PreviewPage2 } from './components/PreviewPage2';
import { PreviewPage3 } from './components/PreviewPage3';
import { PreviewPage4 } from './components/PreviewPage4';
import { INITIAL_DATA } from './constants';
import { StudentData } from './types';
import { Printer, RotateCcw, Settings, X, Save, Eye, EyeOff, Loader2, Search, FileJson, Trash2 } from 'lucide-react';

/**
 * Utility to convert Google Drive "Viewer" or "UC" links into "Direct Stream" links.
 */
const fixDriveUrl = (url: string) => {
  if (!url || (!url.includes('drive.google.com') && !url.includes('googleusercontent.com'))) return url;
  const match = url.match(/\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  if (match && match[1]) {
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
    const savedData = localStorage.getItem('hpc_current_data');
    const hasInteracted = localStorage.getItem('hpc_has_interacted');

    if (savedUrl) setScriptUrl(savedUrl);

    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse local storage data", e);
      }
    } else if (!hasInteracted) {
      // Only auto-load test.json if the user has NEVER used the app before
      loadTestData(true);
    }
  }, []);

  useEffect(() => {
    if (data !== INITIAL_DATA) {
      localStorage.setItem('hpc_current_data', JSON.stringify(data));
      localStorage.setItem('hpc_has_interacted', 'true');
    }
  }, [data]);

  const loadTestData = async (isSilent = false) => {
    try {
      const response = await fetch('/test.json');
      if (response.ok) {
        const testData = await response.json();
        setData(testData);
        if (!isSilent) {
          setStatusMsg({ type: 'success', text: 'Sample test data loaded!' });
          setTimeout(() => setStatusMsg(null), 3000);
        }
      }
    } catch (error) {
      console.error("Failed to load test.json", error);
    }
  };

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

  const resetToInitial = () => {
    if (confirm("Wipe all data and start with an empty form?")) {
      setData(INITIAL_DATA);
      localStorage.removeItem('hpc_current_data');
      localStorage.setItem('hpc_has_interacted', 'true'); // Flag to prevent auto-reload of test.json
      setStatusMsg({ type: 'success', text: 'Form cleared.' });
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-white shadow-sm p-4 print:hidden sticky top-0 z-50 border-b">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">HPC JSON Generator</h1>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">V3.9</span>
          </div>
          {statusMsg && (
            <div className={`px-4 py-2 rounded text-sm font-bold shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${statusMsg.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
              {statusMsg.text}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPreview(!showPreview)} className="px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50 flex items-center gap-2 shadow-sm">
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />} {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <button onClick={resetToInitial} className="p-2 text-red-600 hover:bg-red-50 rounded border bg-white shadow-sm flex items-center gap-2 px-3 text-sm font-bold" title="Clear All Form Data"><Trash2 size={16} /> Clear Form</button>
            <button onClick={handleSaveToDrive} disabled={isSaving} className={`flex items-center gap-2 px-4 py-2 text-sm font-black text-white rounded shadow-md ${isSaving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {isSaving ? 'Saving...' : 'Save to Drive'}
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded shadow-md hover:bg-blue-700">
              <Printer size={16} /> Print
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded border bg-white shadow-sm" title="Settings"><Settings size={18} /></button>
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
            <select onChange={(e) => loadStudentData(e.target.value)} disabled={isLoadingRecord || (studentList.length === 0 && !scriptUrl)} className="w-full border rounded-lg p-2 text-sm bg-indigo-50/30 border-indigo-100 outline-none focus:border-indigo-400" value="">
              <option value="">{scriptUrl ? (studentList.length > 0 ? `Select from ${studentList.length} students` : 'Enter Grade/Section to search...') : 'No Script URL Configured'}</option>
              {studentList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Editor data={data} onChange={setData} />
        </div>

        {showPreview && (
          <div className="flex-1 bg-gray-400/20 p-4 lg:h-[calc(100vh-80px)] overflow-auto flex flex-col items-center gap-12 print:p-0 print:bg-white print:block">
             <div className="origin-top shadow-2xl print:shadow-none"><Preview data={data} /></div>
             <div className="origin-top shadow-2xl print:shadow-none"><PreviewPage2 data={data} /></div>
             <div className="origin-top shadow-2xl print:shadow-none"><PreviewPage3 data={data} /></div>
             <div className="origin-top shadow-2xl print:shadow-none mb-12"><PreviewPage4 data={data} /></div>
          </div>
        )}
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-black text-gray-800">Application Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div>
                   <h3 className="font-bold text-indigo-800 flex items-center gap-2"><FileJson size={18}/> Testing Actions</h3>
                   <p className="text-xs text-indigo-600">Populate sample data for a quick overview.</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => loadTestData(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black hover:bg-indigo-700 transition-all shadow-md">Populate Test Data</button>
                   <button onClick={resetToInitial} className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-black hover:bg-red-50 transition-all flex items-center gap-1 shadow-sm"><RotateCcw size={14}/> Clear Form</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Google Apps Script URL</label>
                <div className="flex flex-col gap-1">
                  <input type="text" placeholder="https://script.google.com/macros/s/.../exec" className="w-full border-2 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all" value={scriptUrl} onChange={(e) => setScriptUrl(e.target.value)} />
                </div>
              </div>
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Script Code (V3.3+)</span>
                    <button onClick={copyToClipboard} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-black shadow-md hover:bg-blue-700 transition-all">{copied ? 'COPIED!' : 'COPY CODE'}</button>
                </div>
                <pre className="bg-gray-900 text-gray-300 p-5 rounded-xl text-[10px] overflow-x-auto border-4 border-gray-800 font-mono leading-relaxed max-h-[250px]">{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={saveSettings} className="px-8 py-2 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg">Save & Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          #print-area, #print-area-page-2, #print-area-page-3, #print-area-page-4 { page-break-after: always; display: block !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
          header, .print-hidden, .bg-gray-100 { display: none !important; }
          main { background: white !important; display: block !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { PreviewPage2 } from './components/PreviewPage2';
import { INITIAL_DATA, MONTHS } from './constants';
import { StudentData } from './types';
import { Printer, RotateCcw, Settings, X, Save, Copy, Check, Eye, EyeOff, Loader2 } from 'lucide-react';

const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  // 1. Handle Drive Folder & Photos
  var folderName = (data.grade || "Unsorted") + (data.section || "");
  var mainFolder;
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    mainFolder = folders.next();
  } else {
    mainFolder = DriveApp.createFolder(folderName);
  }

  function saveImage(base64Data, type) {
    if (!base64Data || !base64Data.includes("base64,")) return "";
    try {
      var splitData = base64Data.split("base64,");
      var contentType = splitData[0].split(":")[1].split(";")[0];
      var bytes = Utilities.base64Decode(splitData[1]);
      var fileName = (data.rollNo || "NoRoll") + "_" + type + "_" + new Date().getTime() + ".png";
      var blob = Utilities.newBlob(bytes, contentType, fileName);
      var file = mainFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return file.getUrl();
    } catch (err) {
      return "Error saving image: " + err.toString();
    }
  }

  var studentPhotoUrl = saveImage(data.photoUrl, "Student");
  var mePhotoUrl = saveImage(data.mePhotoUrl, "Me");
  var familyPhotoUrl = saveImage(data.familyPhotoUrl, "Family");

  // 2. Prepare Row Data (90+ Columns)
  var months = ['APR', 'MAY', 'JUNE', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'];
  var row = [
    new Date(), // Last Modified
    data.schoolName, data.village, data.brc, data.crc, data.state, data.pinCode, 
    data.udiseCode, data.teacherCode, data.apaarId,
    data.studentName, data.rollNo, data.registrationNo, data.grade, data.section, 
    data.dob, data.age, data.address, data.phone, studentPhotoUrl,
    data.motherName, data.motherEducation, data.motherOccupation,
    data.fatherName, data.fatherEducation, data.fatherOccupation,
    data.siblingsCount, data.siblingsAge, data.motherTongue, data.mediumOfInstruction,
    data.isRural ? "Rural" : "Urban", data.illnessCount
  ];

  // Interests (reading...chores, other, specify)
  var interestKeys = ['reading', 'music', 'sports', 'creativeWriting', 'gardening', 'yoga', 'art', 'craft', 'cooking', 'chores', 'other'];
  interestKeys.forEach(function(key) {
    row.push(data.interests[key] ? "Yes" : "No");
  });
  row.push(data.interests.otherSpecify || "");

  // Attendance (3 cols per month)
  months.forEach(function(m) {
    var att = data.attendance[m] || {workingDays: "", daysPresent: "", percentage: ""};
    row.push(att.workingDays);
    row.push(att.daysPresent);
    row.push(att.percentage);
  });

  row.push(data.attendanceReason || "");

  // Page 2 Fields
  row.push(mePhotoUrl);
  row.push(familyPhotoUrl);
  row.push(data.ambition || "");
  row.push(data.friends || "");
  row.push(data.favColour || "");
  row.push(data.favFood || "");
  row.push(data.favAnimal || "");
  row.push(data.favFlower || "");
  row.push(data.favSport || "");
  row.push(data.favSubject || "");

  sheet.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({"result":"success", "url": studentPhotoUrl})).setMimeType(ContentService.MimeType.JSON);
}`;

export default function App() {
  const [data, setData] = useState<StudentData>(INITIAL_DATA);
  const [scriptUrl, setScriptUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem('hpc_script_url');
    if (savedUrl) setScriptUrl(savedUrl);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setData(INITIAL_DATA);
    }
  };

  const handleSaveToSheet = async () => {
    if (!scriptUrl) {
      setShowSettings(true);
      setStatusMsg({ type: 'error', text: 'Please configure the Google Script URL first.' });
      return;
    }

    setIsSaving(true);
    setStatusMsg(null);

    try {
      // Note: GAS requires no-cors for simple fetch calls unless complex headers are handled
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      setStatusMsg({ type: 'success', text: 'Data and Photos sent to Sheet successfully!' });
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'Failed to save data. Check your Script URL and Drive permissions.' });
    } finally {
      setIsSaving(false);
    }
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
            <h1 className="text-xl font-bold text-gray-800">HPC Card Generator</h1>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">V2.0 - Drive Enabled</span>
          </div>

          {statusMsg && (
            <div className={`px-4 py-2 rounded text-sm font-bold shadow-sm transition-all ${statusMsg.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'} animate-pulse`}>
              {statusMsg.text}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowPreview(!showPreview)} 
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50 transition-colors font-medium"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />} 
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded border transition-colors bg-white shadow-sm"
              title="Configuration"
            >
              <Settings size={18} />
            </button>

            <button 
              onClick={handleSaveToSheet} 
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-black text-white rounded shadow-md transition-all uppercase tracking-wide ${isSaving ? 'bg-gray-400' : 'bg-[#E36C0A] hover:bg-[#c55d08]'}`}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Uploading...' : 'Save to Sheet'}
            </button>

            <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors bg-white">
              <RotateCcw size={16} /> Reset
            </button>
            
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded shadow-md hover:bg-blue-700 transition-colors">
              <Printer size={16} /> Print HPC Card
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1600px] mx-auto w-full bg-gray-200/50">
        <div className={`p-4 lg:h-[calc(100vh-80px)] overflow-hidden print:hidden flex-shrink-0 transition-all ${showPreview ? 'w-full lg:w-[480px]' : 'w-full'}`}>
          <Editor data={data} onChange={setData} />
        </div>

        {showPreview && (
          <div className="flex-1 bg-gray-400/20 p-4 lg:h-[calc(100vh-80px)] overflow-auto flex flex-col items-center gap-12 print:p-0 print:h-auto print:bg-white print:block">
             <div className="origin-top shadow-2xl print:shadow-none transition-transform">
               <Preview data={data} />
             </div>
             <div className="origin-top shadow-2xl print:shadow-none transition-transform mb-12">
               <PreviewPage2 data={data} />
             </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-gray-100">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Settings size={20} /></div>
                 <div>
                    <h2 className="text-xl font-black text-gray-800 leading-tight">Sheet & Drive Integration</h2>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Configure your Google backend</p>
                 </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 p-2 transition-colors"><X /></button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-tight">Google Apps Script Web App URL</label>
                <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all shadow-sm group-hover:border-gray-300"
                      value={scriptUrl}
                      onChange={(e) => setScriptUrl(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 mt-3 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <div className="text-xs font-bold leading-tight flex flex-col gap-1">
                        <span>⚠️ Ensure your script deployment is set to "Anyone" has access.</span>
                        <span>⚠️ This script will create folders in your Drive for photos.</span>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h3 className="font-black text-blue-800 text-sm mb-3 uppercase">1. Google Sheet Setup</h3>
                    <ul className="text-xs text-blue-900 space-y-2 list-disc ml-4 font-medium">
                      <li>Open your target Google Sheet.</li>
                      <li>Go to <strong>Extensions &gt; Apps Script</strong>.</li>
                      <li>Delete all existing code and paste the block shown here.</li>
                    </ul>
                  </div>
                  <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                    <h3 className="font-black text-indigo-800 text-sm mb-3 uppercase">2. Deployment Settings</h3>
                    <ul className="text-xs text-indigo-900 space-y-2 list-disc ml-4 font-medium">
                      <li>Click <strong>Deploy &gt; New Deployment</strong>.</li>
                      <li>Select <strong>Web App</strong>.</li>
                      <li>Execute as <strong>"Me"</strong>.</li>
                      <li>Who has access: <strong>"Anyone"</strong>.</li>
                    </ul>
                  </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Script Template (Copy this)</span>
                    <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-black hover:bg-blue-700 transition-all shadow-md active:scale-95"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'COPIED!' : 'COPY CODE'}
                    </button>
                </div>
                <pre className="bg-gray-900 text-gray-300 p-5 rounded-xl text-[10px] overflow-x-auto border-4 border-gray-800 font-mono shadow-inner leading-relaxed max-h-[300px]">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => setShowSettings(false)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Dismiss</button>
              <button onClick={saveSettings} className="px-8 py-2 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Save & Link Account</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          #print-area, #print-area-page-2 { 
            page-break-after: always; 
            display: block !important; 
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          #print-area-page-2 { page-break-before: always; }
          header, .print-hidden, .bg-gray-100, .lg-h-screen { background: white !important; display: none !important; }
          main { background: white !important; display: block !important; padding: 0 !important; max-width: none !important; }
        }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #aaa; }
      `}</style>
    </div>
  );
}
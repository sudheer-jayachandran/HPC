import { useState, useEffect } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { INITIAL_DATA } from './constants';
import { StudentData } from './types';
import { Printer, RotateCcw, UploadCloud, Settings, X, Save, Copy, Check } from 'lucide-react';

const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    // --- Handle Photo Upload (Base64 to Drive Folder) ---
    var photoLink = "";
    if (data.photoUrl && data.photoUrl.startsWith("data:image/")) {
      try {
        var split = data.photoUrl.split('base64,');
        var contentType = split[0].replace('data:', '').replace(';', '');
        var base64Data = split[1];
        var decoded = Utilities.base64Decode(base64Data);
        var fileName = (data.studentName || "Student") + "_Photo_" + new Date().getTime();
        var blob = Utilities.newBlob(decoded, contentType, fileName);
        
        // 1. Determine Folder Name (Grade_Section)
        var folderName = (data.grade || "Unassigned") + "_" + (data.section || "NA");
        
        // 2. Find or Create Folder
        var folders = DriveApp.getFoldersByName(folderName);
        var folder;
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder(folderName);
        }
        
        // 3. Save File to that Folder
        var file = folder.createFile(blob);
        
        // Make sure it's accessible via link
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        photoLink = file.getUrl();
      } catch (err) {
        photoLink = "Error saving photo: " + err.toString();
      }
    } else {
        photoLink = data.photoUrl || "";
    }

    // --- 1. Define Headers ---
    var baseHeaders = [
      "Last Modified",
      "School Name", "Village", "BRC", "CRC", "State", "Pin Code", "UDISE Code", "Teacher Code", "APAAR ID",
      "Student Name", "Roll No", "Registration No", "Grade", "Section", "DOB", "Address", "Phone", "Student Photo",
      "Mother Name", "Mother Education", "Mother Occupation",
      "Father Name", "Father Education", "Father Occupation",
      "Siblings Count", "Siblings Age", "Mother Tongue", "Medium of Instruction", "Locality", "Illness Count"
    ];

    // Interest Headers
    var interestKeys = ["reading", "music", "sports", "creativeWriting", "gardening", "yoga", "art", "craft", "cooking", "chores", "other", "otherSpecify"];
    var interestHeaders = interestKeys.map(function(k) { return "Interest: " + k; });

    // Attendance Headers
    var months = ['APR', 'MAY', 'JUNE', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'];
    var attendanceHeaders = [];
    months.forEach(function(m) {
      attendanceHeaders.push(m + " Working");
      attendanceHeaders.push(m + " Present");
      attendanceHeaders.push(m + " %");
      attendanceHeaders.push(m + " Reason");
    });

    // Combine all headers
    var allHeaders = baseHeaders.concat(interestHeaders).concat(attendanceHeaders);

    // --- 2. Create Headers if Sheet is Empty ---
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(allHeaders);
    }

    // --- 3. Construct Row Data ---
    var row = [];

    // Base Data
    var locality = "";
    if (data.isRural === true) locality = "Rural";
    else if (data.isRural === false) locality = "Urban";

    row.push(new Date());
    row.push(data.schoolName);
    row.push(data.village);
    row.push(data.brc);
    row.push(data.crc);
    row.push(data.state);
    row.push(data.pinCode);
    row.push("'" + data.udiseCode); // Prevent scientific notation
    row.push(data.teacherCode);
    row.push(data.apaarId);
    row.push(data.studentName);
    row.push(data.rollNo);
    row.push(data.registrationNo);
    row.push(data.grade);
    row.push(data.section);
    row.push(data.dob);
    row.push(data.address);
    row.push("'" + data.phone); // Prevent scientific notation
    row.push(photoLink); // Add Photo Link here
    row.push(data.motherName);
    row.push(data.motherEducation);
    row.push(data.motherOccupation);
    row.push(data.fatherName);
    row.push(data.fatherEducation);
    row.push(data.fatherOccupation);
    row.push(data.siblingsCount);
    row.push(data.siblingsAge);
    row.push(data.motherTongue);
    row.push(data.mediumOfInstruction);
    row.push(locality);
    row.push(data.illnessCount);

    // Interests Data
    interestKeys.forEach(function(k) {
      if (k === 'otherSpecify') {
        row.push(data.interests[k]);
      } else {
        // Convert boolean to Yes/No for better readability
        row.push(data.interests[k] ? "Yes" : "No");
      }
    });

    // Attendance Data
    months.forEach(function(m) {
      var mData = data.attendance[m] || { workingDays: "", daysPresent: "", percentage: "", reason: "" };
      row.push(mData.workingDays);
      row.push(mData.daysPresent);
      row.push(mData.percentage);
      row.push(mData.reason);
    });

    // --- 4. Append Row ---
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function App() {
  const [data, setData] = useState<StudentData>(INITIAL_DATA);
  const [scriptUrl, setScriptUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
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
      setStatusMsg(null);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('hpc_script_url', scriptUrl);
    setShowSettings(false);
    setStatusMsg({ type: 'success', text: 'Settings saved locally.' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToSheet = async () => {
    if (!scriptUrl) {
      setShowSettings(true);
      return;
    }

    setIsSaving(true);
    setStatusMsg(null);

    try {
      // We use no-cors mode because Google Apps Script Web Apps don't support CORS preflight perfectly
      // without complex setup. 'no-cors' means we can send data but can't read the response text.
      // This is standard for simple form submissions to Sheets.
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      setStatusMsg({ type: 'success', text: 'Data sent to Google Sheet!' });
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'Failed to send data. Check console.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Navigation / Toolbar */}
      <header className="bg-white shadow-sm p-4 print:hidden sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">Holistic Progress Card (HPC) Generator</h1>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Foundational Stage</span>
          </div>
          
          <div className="flex items-center gap-3">
            {statusMsg && (
              <span className={`text-sm font-medium ${statusMsg.type === 'success' ? 'text-green-600' : 'text-red-600'} animate-fade-in`}>
                {statusMsg.text}
              </span>
            )}

            <button onClick={() => setShowSettings(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Settings">
              <Settings size={20} />
            </button>

            <button 
              onClick={handleSaveToSheet} 
              disabled={isSaving}
              className={`flex items-center gap-2 px-3 py-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <UploadCloud size={16} /> {isSaving ? 'Saving...' : 'Save to Sheet'}
            </button>

            <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-white border border-gray-300 rounded hover:bg-red-50 transition">
              <RotateCcw size={16} /> Reset
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm transition">
              <Printer size={16} /> Print / Save PDF
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Google Sheet Configuration</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-bold text-sm text-gray-700 mb-2">1. Setup Script</h4>
                    <p className="text-xs text-gray-600 mb-2">Copy this code into your Google Apps Script editor (replacing everything in Code.gs).</p>
                    <div className="relative">
                        <pre className="bg-gray-800 text-gray-100 p-3 rounded text-[10px] h-60 overflow-auto whitespace-pre-wrap font-mono">
                            {GOOGLE_APPS_SCRIPT_CODE}
                        </pre>
                        <button 
                            onClick={copyCode}
                            className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white p-1 rounded"
                            title="Copy Code"
                        >
                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-sm text-gray-700 mb-2">2. Instructions</h4>
                    <ol className="list-decimal ml-4 text-xs text-gray-600 space-y-2">
                        <li>Create a new <strong>Google Sheet</strong>.</li>
                        <li>Go to <strong>Extensions &gt; Apps Script</strong>.</li>
                        <li><strong>Delete</strong> any existing code and <strong>Paste</strong> the code from the left.</li>
                        <li>Click <strong>Deploy &gt; New Deployment</strong>.</li>
                        <li>Select type: <strong>"Web App"</strong>.</li>
                        <li>Description: "HPC Saver" (or anything).</li>
                        <li>Execute as: <strong>"Me"</strong>.</li>
                        <li>Who has access: <strong>"Anyone"</strong>.</li>
                        <li>Click <strong>Deploy</strong> and copy the Web App URL.</li>
                        <li><strong>Paste the URL below.</strong></li>
                        <li className="text-blue-600 font-bold">Note: You will be asked to grant "DriveApp" permissions when running the new script. Allow it.</li>
                    </ol>

                    <div className="mt-6">
                        <label className="block text-xs font-bold mb-1 text-gray-700">Web App URL</label>
                        <input 
                            type="text" 
                            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="https://script.google.com/macros/s/..."
                            value={scriptUrl}
                            onChange={(e) => setScriptUrl(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleSaveSettings} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                <Save size={16} /> Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1600px] mx-auto w-full">
        
        {/* Left Panel: Editor */}
        <div className="w-full lg:w-[450px] p-4 lg:h-[calc(100vh-80px)] overflow-hidden print:hidden flex-shrink-0">
          <Editor data={data} onChange={setData} />
        </div>

        {/* Right Panel: Preview */}
        <div className="flex-1 bg-gray-500/10 p-4 lg:h-[calc(100vh-80px)] overflow-auto flex justify-center print:p-0 print:h-auto print:overflow-visible print:bg-white print:block">
           <div className="origin-top scale-[0.5] sm:scale-[0.6] md:scale-[0.8] lg:scale-[0.85] xl:scale-100 print:scale-100 transition-transform duration-200">
             <Preview data={data} />
           </div>
        </div>

      </main>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background-color: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
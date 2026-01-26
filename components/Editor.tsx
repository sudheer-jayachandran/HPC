
import React from 'react';
import { StudentData, MonthKey } from '../types';
import { MONTHS } from '../constants';
import { ChevronDown, ChevronUp, X, User } from 'lucide-react';

interface EditorProps {
  data: StudentData;
  onChange: (data: StudentData) => void;
}

// Fixed: Defined labels outside component for performance and to provide a stable index type
const INTEREST_LABELS: Partial<Record<keyof StudentData['interests'], string>> = {
  reading: 'Reading',
  music: 'Music/Dance',
  sports: 'Sports/Games',
  creativeWriting: 'Creative Writing',
  gardening: 'Gardening',
  yoga: 'Yoga',
  art: 'Art',
  craft: 'Craft',
  cooking: 'Cooking',
  chores: 'Home Chores',
  other: 'Other'
};

const SectionHeader = ({ title, isOpen, toggle, icon }: { title: string, isOpen: boolean, toggle: () => void, icon?: React.ReactNode }) => (
  <button 
    onClick={toggle}
    className={`flex items-center justify-between w-full p-3 border-b transition-colors text-left ${isOpen ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
  >
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-500">{icon}</span>}
      <span className="font-bold text-gray-700 text-sm">{title}</span>
    </div>
    {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
  </button>
);

export const Editor: React.FC<EditorProps> = ({ data, onChange }) => {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    school: false,
    student: true,
    family: false,
    attendance: false,
    interests: false,
    page2: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const calculateAge = (dobString: string): string => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age.toString() : '0';
  };

  const handleChange = (field: keyof StudentData, value: any) => {
    const newData = { ...data, [field]: value };
    
    // Auto-calculate age if DOB changes
    if (field === 'dob') {
      const calculatedAge = calculateAge(value);
      if (calculatedAge) {
        newData.age = calculatedAge;
      }
    }
    
    onChange(newData);
  };

  const handleInterestChange = (field: keyof typeof data.interests, value: any) => {
    onChange({
      ...data,
      interests: { ...data.interests, [field]: value }
    });
  };

  const handleAttendanceChange = (month: MonthKey, field: string, value: string) => {
    const updatedMonthData = { ...data.attendance[month], [field]: value };
    if (field === 'workingDays' || field === 'daysPresent') {
      const working = parseFloat(field === 'workingDays' ? value : updatedMonthData.workingDays);
      const present = parseFloat(field === 'daysPresent' ? value : updatedMonthData.daysPresent);
      if (!isNaN(working) && !isNaN(present) && working > 0) {
        updatedMonthData.percentage = Math.round((present / working) * 100) + '%';
      } else if (value === '') {
        updatedMonthData.percentage = '';
      }
    }
    onChange({ ...data, attendance: { ...data.attendance, [month]: updatedMonthData } });
  };

  const handlePhotoUpload = (field: 'photoUrl' | 'familyPhotoUrl' | 'mePhotoUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size is too large. Please upload an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(field, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full flex flex-col border border-gray-200">
      <div className="p-3 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
        <User size={16} /> Data Entry Form
      </div>
      <div className="overflow-y-auto flex-1 p-3 space-y-2 bg-gray-50/50">
        
        {/* School Info */}
        <div className="border rounded bg-white shadow-sm overflow-hidden">
          <SectionHeader title="School Identification" isOpen={openSections.school} toggle={() => toggleSection('school')} />
          {openSections.school && (
            <div className="p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="md:col-span-2 xl:col-span-4">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">School Name & Address</label>
                <input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.schoolName} onChange={(e) => handleChange('schoolName', e.target.value)} />
              </div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Village</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.village} onChange={(e) => handleChange('village', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">State</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.state} onChange={(e) => handleChange('state', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">BRC</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.brc} onChange={(e) => handleChange('brc', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">CRC</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.crc} onChange={(e) => handleChange('crc', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Pin Code</label><input type="text" maxLength={6} className="w-full border rounded p-2 text-sm bg-gray-50" value={data.pinCode} onChange={(e) => handleChange('pinCode', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">UDISE Code</label><input type="text" maxLength={11} className="w-full border rounded p-2 text-sm bg-gray-50" value={data.udiseCode} onChange={(e) => handleChange('udiseCode', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Teacher Code</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.teacherCode} onChange={(e) => handleChange('teacherCode', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">APAAR ID</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.apaarId} onChange={(e) => handleChange('apaarId', e.target.value)} /></div>
            </div>
          )}
        </div>

        {/* General Info */}
        <div className="border rounded bg-white shadow-sm overflow-hidden">
          <SectionHeader title="Student Details" isOpen={openSections.student} toggle={() => toggleSection('student')} />
          {openSections.student && (
            <div className="p-3 grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase text-indigo-500 mb-1">Student Name (Required for filename)</label>
                <input type="text" className="w-full border-2 border-indigo-100 rounded-lg p-2 text-sm font-bold focus:border-indigo-400 outline-none" placeholder="e.g. John Doe" value={data.studentName} onChange={(e) => handleChange('studentName', e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Grade</label>
                <select className="w-full border rounded p-2 text-sm bg-white" value={data.grade} onChange={(e) => handleChange('grade', e.target.value)}>
                  <option value="">Select</option>
                  <option value="BV1">BV1</option>
                  <option value="BV2">BV2</option>
                  <option value="BV3">BV3</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                </select>
              </div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Section</label><input type="text" className="w-full border rounded p-2 text-sm" placeholder="A, B, Blue..." value={data.section} onChange={(e) => handleChange('section', e.target.value)} /></div>
              
              <div className="col-span-2 bg-gray-50 p-2 rounded border border-dashed border-gray-300">
                <label className="block text-[10px] font-black mb-2 uppercase text-gray-500">Profile Photo (Page 1)</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-14 bg-white border border-gray-300 flex items-center justify-center overflow-hidden rounded">
                    {data.photoUrl ? <img src={data.photoUrl} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-[8px] text-gray-400">N/A</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload('photoUrl', e)} className="block w-full text-[10px] text-gray-500" />
                  {data.photoUrl && <button onClick={() => handleChange('photoUrl', '')} className="text-red-400"><X size={14} /></button>}
                </div>
              </div>

              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Roll No.</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.rollNo} onChange={(e) => handleChange('rollNo', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Reg No.</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.registrationNo} onChange={(e) => handleChange('registrationNo', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Phone</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.phone} onChange={(e) => handleChange('phone', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Birth Date</label><input type="date" className="w-full border rounded p-2 text-sm" value={data.dob} onChange={(e) => handleChange('dob', e.target.value)} /></div>
              <div className="col-span-2"><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Address</label><textarea className="w-full border rounded p-2 text-sm" rows={2} value={data.address} onChange={(e) => handleChange('address', e.target.value)} /></div>
            </div>
          )}
        </div>

        {/* Family Information */}
        <div className="border rounded bg-white shadow-sm overflow-hidden">
          <SectionHeader title="Family & Caregiver" isOpen={openSections.family} toggle={() => toggleSection('family')} />
          {openSections.family && (
            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2"><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Mother/Guardian Name</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.motherName} onChange={(e) => handleChange('motherName', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Mother Education</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.motherEducation} onChange={(e) => handleChange('motherEducation', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Mother Occupation</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.motherOccupation} onChange={(e) => handleChange('motherOccupation', e.target.value)} /></div>
              <div className="md:col-span-2"><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Father/Guardian Name</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.fatherName} onChange={(e) => handleChange('fatherName', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Father Education</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.fatherEducation} onChange={(e) => handleChange('fatherEducation', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Father Occupation</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.fatherOccupation} onChange={(e) => handleChange('fatherOccupation', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Siblings</label><input type="text" className="w-full border rounded p-2 text-sm" placeholder="e.g. 2" value={data.siblingsCount} onChange={(e) => handleChange('siblingsCount', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Siblings' Age</label><input type="text" className="w-full border rounded p-2 text-sm" placeholder="e.g. 5, 8" value={data.siblingsAge} onChange={(e) => handleChange('siblingsAge', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Mother Tongue</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.motherTongue} onChange={(e) => handleChange('motherTongue', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Instruction Medium</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.mediumOfInstruction} onChange={(e) => handleChange('mediumOfInstruction', e.target.value)} /></div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Area Type</label>
                <div className="flex gap-4 p-2 border rounded bg-white h-9 items-center">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={data.isRural === true} onChange={() => handleChange('isRural', true)} /> Rural</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={data.isRural === false} onChange={() => handleChange('isRural', false)} /> Urban</label>
                </div>
              </div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Illness frequency</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.illnessCount} onChange={(e) => handleChange('illnessCount', e.target.value)} /></div>
            </div>
          )}
        </div>

        {/* Attendance */}
        <div className="border rounded bg-white shadow-sm overflow-hidden">
          <SectionHeader title="Monthly Attendance" isOpen={openSections.attendance} toggle={() => toggleSection('attendance')} />
          {openSections.attendance && (
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-1 text-left text-[9px] uppercase font-black text-gray-400">Month</th>
                      <th className="border p-1 text-[9px] uppercase font-black text-gray-400">Work</th>
                      <th className="border p-1 text-[9px] uppercase font-black text-gray-400">Pres</th>
                      <th className="border p-1 text-[9px] uppercase font-black text-gray-400">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTHS.map(month => (
                      <tr key={month}>
                        <td className="border p-1 font-bold">{month}</td>
                        <td className="border p-1"><input type="text" className="w-10 border-0 bg-transparent p-1 text-center text-xs" value={data.attendance[month].workingDays} onChange={(e) => handleAttendanceChange(month, 'workingDays', e.target.value)} /></td>
                        <td className="border p-1"><input type="text" className="w-10 border-0 bg-transparent p-1 text-center text-xs" value={data.attendance[month].daysPresent} onChange={(e) => handleAttendanceChange(month, 'daysPresent', e.target.value)} /></td>
                        <td className="border p-1 bg-gray-50 text-center font-bold text-indigo-600">{data.attendance[month].percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Reason for low attendance</label>
                <textarea className="w-full border rounded p-2 text-sm" rows={2} value={data.attendanceReason} onChange={(e) => handleChange('attendanceReason', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Interests */}
        <div className="border rounded bg-white shadow-sm overflow-hidden">
          <SectionHeader title="Student Interests" isOpen={openSections.interests} toggle={() => toggleSection('interests')} />
          {openSections.interests && (
            <div className="p-3 grid grid-cols-2 gap-2">
              {/* Fixed: cast Object.keys to (keyof StudentData['interests'] & string) to avoid 'symbol' index error */}
              {(Object.keys(data.interests) as Array<keyof StudentData['interests'] & string>).map(key => {
                if (key === 'otherSpecify') return null;
                
                return (
                  <label key={key} className="flex items-center gap-2 text-xs cursor-pointer p-1.5 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100">
                    <input type="checkbox" checked={!!data.interests[key]} onChange={(e) => handleInterestChange(key, e.target.checked)} />
                    {INTEREST_LABELS[key]}
                  </label>
                );
              })}
              {data.interests.other && (
                <div className="col-span-2 mt-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Specify Other Interests</label>
                  <textarea className="w-full border rounded p-2 text-sm" rows={2} value={data.interests.otherSpecify} onChange={(e) => handleInterestChange('otherSpecify', e.target.value)} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Page 2 Info */}
        <div className="border rounded bg-white shadow-sm overflow-hidden">
          <SectionHeader title="Me & My Surroundings" isOpen={openSections.page2} toggle={() => toggleSection('page2')} />
          {openSections.page2 && (
            <div className="p-3 grid grid-cols-2 gap-3">
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2 rounded border border-dashed border-gray-300">
                  <label className="block text-[10px] font-black mb-1 uppercase text-gray-500">This is Me Photo</label>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-white border border-gray-300 flex items-center justify-center overflow-hidden rounded-full">
                      {data.mePhotoUrl ? <img src={data.mePhotoUrl} alt="Me" className="w-full h-full object-cover" /> : <span className="text-[8px] text-gray-400">Insert</span>}
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload('mePhotoUrl', e)} className="block w-full text-[9px] text-gray-400" />
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded border border-dashed border-gray-300">
                  <label className="block text-[10px] font-black mb-1 uppercase text-gray-500">Family Photo</label>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-white border border-gray-300 flex items-center justify-center overflow-hidden rounded-xl">
                      {data.familyPhotoUrl ? <img src={data.familyPhotoUrl} alt="Family" className="w-full h-full object-cover" /> : <span className="text-[8px] text-gray-400">Insert</span>}
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload('familyPhotoUrl', e)} className="block w-full text-[9px] text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Ambition</label>
                <input type="text" className="w-full border rounded p-2 text-sm" placeholder="I want to be a..." value={data.ambition} onChange={(e) => handleChange('ambition', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Friends (Comma separated)</label>
                <input type="text" className="w-full border rounded p-2 text-sm" placeholder="Friend 1, Friend 2..." value={data.friends} onChange={(e) => handleChange('friends', e.target.value)} />
              </div>
              
              <div className="col-span-2 border-t pt-2 mt-2 font-black text-[10px] uppercase text-gray-400">Favourites</div>
              <div><label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Colour</label><input type="text" className="w-full border rounded p-1 text-xs" value={data.favColour} onChange={(e) => handleChange('favColour', e.target.value)} /></div>
              <div><label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Food</label><input type="text" className="w-full border rounded p-1 text-xs" value={data.favFood} onChange={(e) => handleChange('favFood', e.target.value)} /></div>
              <div><label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Animal</label><input type="text" className="w-full border rounded p-1 text-xs" value={data.favAnimal} onChange={(e) => handleChange('favAnimal', e.target.value)} /></div>
              <div><label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Flower</label><input type="text" className="w-full border rounded p-1 text-xs" value={data.favFlower} onChange={(e) => handleChange('favFlower', e.target.value)} /></div>
              <div><label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Sport</label><input type="text" className="w-full border rounded p-1 text-xs" value={data.favSport} onChange={(e) => handleChange('favSport', e.target.value)} /></div>
              <div><label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Subject</label><input type="text" className="w-full border rounded p-1 text-xs" value={data.favSubject} onChange={(e) => handleChange('favSubject', e.target.value)} /></div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

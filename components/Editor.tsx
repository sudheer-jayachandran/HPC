
import React from 'react';
import { StudentData, MonthKey } from '../types';
import { MONTHS } from '../constants';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface EditorProps {
  data: StudentData;
  onChange: (data: StudentData) => void;
}

const SectionHeader = ({ title, isOpen, toggle }: { title: string, isOpen: boolean, toggle: () => void }) => (
  <button 
    onClick={toggle}
    className="flex items-center justify-between w-full p-3 bg-gray-100 border-b border-gray-200 hover:bg-gray-200 transition-colors text-left"
  >
    <span className="font-semibold text-gray-700">{title}</span>
    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
  </button>
);

export const Editor: React.FC<EditorProps> = ({ data, onChange }) => {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    school: true,
    student: true,
    family: false,
    attendance: false,
    interests: false,
    page2: true,
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
    <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 bg-blue-600 text-white font-bold text-lg">Data Entry</div>
      <div className="overflow-y-auto flex-1 p-4 space-y-2">
        
        {/* School Info */}
        <div className="border rounded">
          <SectionHeader title="School Information" isOpen={openSections.school} toggle={() => toggleSection('school')} />
          {openSections.school && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="md:col-span-2 xl:col-span-4">
                <label className="block text-xs font-bold mb-1">School Name & Address</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.schoolName} onChange={(e) => handleChange('schoolName', e.target.value)} />
              </div>
              <div><label className="block text-xs font-bold mb-1">Village</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.village} onChange={(e) => handleChange('village', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">State</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.state} onChange={(e) => handleChange('state', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">BRC</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.brc} onChange={(e) => handleChange('brc', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">CRC</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.crc} onChange={(e) => handleChange('crc', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Pin Code</label><input type="text" maxLength={6} className="w-full border rounded p-2 text-sm" value={data.pinCode} onChange={(e) => handleChange('pinCode', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">UDISE Code</label><input type="text" maxLength={11} className="w-full border rounded p-2 text-sm" value={data.udiseCode} onChange={(e) => handleChange('udiseCode', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Teacher Code</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.teacherCode} onChange={(e) => handleChange('teacherCode', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">APAAR ID</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.apaarId} onChange={(e) => handleChange('apaarId', e.target.value)} /></div>
            </div>
          )}
        </div>

        {/* General Info */}
        <div className="border rounded">
          <SectionHeader title="General Information" isOpen={openSections.student} toggle={() => toggleSection('student')} />
          {openSections.student && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="block text-xs font-bold mb-1">Student Name</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.studentName} onChange={(e) => handleChange('studentName', e.target.value)} /></div>
              <div className="col-span-2 bg-gray-50 p-3 rounded border border-dashed border-gray-300">
                <label className="block text-xs font-bold mb-2">Passport Photo (Page 1)</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-20 bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden">
                    {data.photoUrl ? <img src={data.photoUrl} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-[9px] text-gray-500">No Photo</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload('photoUrl', e)} className="block w-full text-xs text-gray-500" />
                  {data.photoUrl && <button onClick={() => handleChange('photoUrl', '')} className="text-red-500"><X size={16} /></button>}
                </div>
              </div>
              <div><label className="block text-xs font-bold mb-1">Roll No.</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.rollNo} onChange={(e) => handleChange('rollNo', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Reg No.</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.registrationNo} onChange={(e) => handleChange('registrationNo', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Grade</label><select className="w-full border rounded p-2 text-sm" value={data.grade} onChange={(e) => handleChange('grade', e.target.value)}><option value="">Select</option><option value="BV1">BV1</option><option value="BV2">BV2</option><option value="BV3">BV3</option><option value="Grade 1">Grade 1</option><option value="Grade 2">Grade 2</option></select></div>
              <div><label className="block text-xs font-bold mb-1">Section</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.section} onChange={(e) => handleChange('section', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Phone</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.phone} onChange={(e) => handleChange('phone', e.target.value)} /></div>
            </div>
          )}
        </div>

        {/* Family Information */}
        <div className="border rounded">
          <SectionHeader title="Family Information" isOpen={openSections.family} toggle={() => toggleSection('family')} />
          {openSections.family && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="block text-xs font-bold mb-1">Mother/Guardian Name</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.motherName} onChange={(e) => handleChange('motherName', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Mother Education</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.motherEducation} onChange={(e) => handleChange('motherEducation', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Mother Occupation</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.motherOccupation} onChange={(e) => handleChange('motherOccupation', e.target.value)} /></div>
              <div className="md:col-span-2"><label className="block text-xs font-bold mb-1">Father/Guardian Name</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.fatherName} onChange={(e) => handleChange('fatherName', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Father Education</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.fatherEducation} onChange={(e) => handleChange('fatherEducation', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Father Occupation</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.fatherOccupation} onChange={(e) => handleChange('fatherOccupation', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Number of Siblings</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.siblingsCount} onChange={(e) => handleChange('siblingsCount', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Siblings' Age</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.siblingsAge} onChange={(e) => handleChange('siblingsAge', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Mother Tongue</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.motherTongue} onChange={(e) => handleChange('motherTongue', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Medium of Instruction</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.mediumOfInstruction} onChange={(e) => handleChange('mediumOfInstruction', e.target.value)} /></div>
              <div>
                <label className="block text-xs font-bold mb-1">Area Type</label>
                <div className="flex gap-4 p-2 border rounded bg-white h-9 items-center">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={data.isRural === true} onChange={() => handleChange('isRural', true)} /> Rural</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={data.isRural === false} onChange={() => handleChange('isRural', false)} /> Urban</label>
                </div>
              </div>
              <div><label className="block text-xs font-bold mb-1">No. of times fallen ill</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.illnessCount} onChange={(e) => handleChange('illnessCount', e.target.value)} /></div>
            </div>
          )}
        </div>

        {/* Attendance */}
        <div className="border rounded">
          <SectionHeader title="Attendance" isOpen={openSections.attendance} toggle={() => toggleSection('attendance')} />
          {openSections.attendance && (
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-1 text-left">Month</th>
                      <th className="border p-1">Working</th>
                      <th className="border p-1">Present</th>
                      <th className="border p-1">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTHS.map(month => (
                      <tr key={month}>
                        <td className="border p-1 font-bold">{month}</td>
                        <td className="border p-1"><input type="text" className="w-12 border rounded p-1 text-center" value={data.attendance[month].workingDays} onChange={(e) => handleAttendanceChange(month, 'workingDays', e.target.value)} /></td>
                        <td className="border p-1"><input type="text" className="w-12 border rounded p-1 text-center" value={data.attendance[month].daysPresent} onChange={(e) => handleAttendanceChange(month, 'daysPresent', e.target.value)} /></td>
                        <td className="border p-1 bg-gray-50 text-center font-bold">{data.attendance[month].percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold mb-1">Reason for low attendance (if any)</label>
                <textarea className="w-full border rounded p-2 text-sm" rows={2} value={data.attendanceReason} onChange={(e) => handleChange('attendanceReason', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Interests */}
        <div className="border rounded">
          <SectionHeader title="Interests" isOpen={openSections.interests} toggle={() => toggleSection('interests')} />
          {openSections.interests && (
            <div className="p-4 grid grid-cols-2 gap-3">
              {(Object.keys(data.interests) as Array<keyof typeof data.interests>).map(key => {
                if (key === 'otherSpecify') return null;
                const labels: Record<string, string> = {
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
                return (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer p-1 hover:bg-gray-50 rounded">
                    <input type="checkbox" checked={!!data.interests[key]} onChange={(e) => handleInterestChange(key, e.target.checked)} />
                    {labels[key]}
                  </label>
                );
              })}
              {data.interests.other && (
                <div className="col-span-2 mt-2">
                  <label className="block text-xs font-bold mb-1">Specify Other Interests</label>
                  <textarea className="w-full border rounded p-2 text-sm" rows={2} value={data.interests.otherSpecify} onChange={(e) => handleInterestChange('otherSpecify', e.target.value)} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Page 2 Info */}
        <div className="border rounded">
          <SectionHeader title="Me & My Surroundings (Page 2)" isOpen={openSections.page2} toggle={() => toggleSection('page2')} />
          {openSections.page2 && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded border border-dashed border-gray-300">
                  <label className="block text-xs font-bold mb-2">My Photo (This is Me)</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden rounded-xl">
                      {data.mePhotoUrl ? <img src={data.mePhotoUrl} alt="Me" className="w-full h-full object-cover" /> : <span className="text-[9px] text-gray-500">No Photo</span>}
                    </div>
                    <div className="flex-1">
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload('mePhotoUrl', e)} className="block w-full text-xs text-gray-500 mb-1" />
                      {data.mePhotoUrl && <button onClick={() => handleChange('mePhotoUrl', '')} className="text-red-500 flex items-center gap-1 text-[10px]"><X size={12} /> Remove</button>}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded border border-dashed border-gray-300">
                  <label className="block text-xs font-bold mb-2">Family Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden rounded-xl">
                      {data.familyPhotoUrl ? <img src={data.familyPhotoUrl} alt="Family" className="w-full h-full object-cover" /> : <span className="text-[9px] text-gray-500">No Photo</span>}
                    </div>
                    <div className="flex-1">
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload('familyPhotoUrl', e)} className="block w-full text-xs text-gray-500 mb-1" />
                      {data.familyPhotoUrl && <button onClick={() => handleChange('familyPhotoUrl', '')} className="text-red-500 flex items-center gap-1 text-[10px]"><X size={12} /> Remove</button>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2 bg-blue-50/50 p-3 rounded border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2 font-bold text-xs text-blue-800 uppercase tracking-wider mb-[-8px]">Basic Bio (Shared with Page 1)</div>
                 <div>
                   <label className="block text-xs font-bold mb-1 text-blue-900">My Birthday is on (DOB)</label>
                   <input type="date" className="w-full border rounded p-2 text-sm bg-white" value={data.dob} onChange={(e) => handleChange('dob', e.target.value)} />
                 </div>
                 <div>
                   <label className="block text-xs font-bold mb-1 text-blue-900 italic">I am (Age)</label>
                   <input type="text" className="w-full border rounded p-2 text-sm bg-yellow-50" placeholder="Auto-calculated" value={data.age} onChange={(e) => handleChange('age', e.target.value)} />
                   <p className="text-[9px] text-gray-500 mt-0.5">Calculated from DOB, but can be edited.</p>
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-xs font-bold mb-1 text-blue-900">I live in (Address)</label>
                   <input type="text" className="w-full border rounded p-2 text-sm bg-white" value={data.address} onChange={(e) => handleChange('address', e.target.value)} />
                 </div>
              </div>

              <div><label className="block text-xs font-bold mb-1">I want to be a...</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.ambition} onChange={(e) => handleChange('ambition', e.target.value)} /></div>
              <div><label className="block text-xs font-bold mb-1">Friends (Comma separated)</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.friends} onChange={(e) => handleChange('friends', e.target.value)} /></div>
              
              <div className="col-span-2 border-t pt-2 mt-2"><h4 className="font-bold text-xs text-gray-500">Favourites</h4></div>
              <div><label className="block text-[10px] font-bold">Colour</label><input type="text" className="w-full border rounded p-1 text-sm" value={data.favColour} onChange={(e) => handleChange('favColour', e.target.value)} /></div>
              <div><label className="block text-[10px] font-bold">Food</label><input type="text" className="w-full border rounded p-1 text-sm" value={data.favFood} onChange={(e) => handleChange('favFood', e.target.value)} /></div>
              <div><label className="block text-[10px] font-bold">Animal</label><input type="text" className="w-full border rounded p-1 text-sm" value={data.favAnimal} onChange={(e) => handleChange('favAnimal', e.target.value)} /></div>
              <div><label className="block text-[10px] font-bold">Flower</label><input type="text" className="w-full border rounded p-1 text-sm" value={data.favFlower} onChange={(e) => handleChange('favFlower', e.target.value)} /></div>
              <div><label className="block text-[10px] font-bold">Sport</label><input type="text" className="w-full border rounded p-1 text-sm" value={data.favSport} onChange={(e) => handleChange('favSport', e.target.value)} /></div>
              <div><label className="block text-[10px] font-bold">Subject</label><input type="text" className="w-full border rounded p-1 text-sm" value={data.favSubject} onChange={(e) => handleChange('favSubject', e.target.value)} /></div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
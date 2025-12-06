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
    attendance: false,
    interests: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (field: keyof StudentData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleInterestChange = (field: keyof typeof data.interests, value: any) => {
    onChange({
      ...data,
      interests: { ...data.interests, [field]: value }
    });
  };

  const handleAttendanceChange = (month: MonthKey, field: string, value: string) => {
    const updatedMonthData = { ...data.attendance[month], [field]: value };

    // Auto-calculate percentage when days change
    if (field === 'workingDays' || field === 'daysPresent') {
      const working = parseFloat(field === 'workingDays' ? value : updatedMonthData.workingDays);
      const present = parseFloat(field === 'daysPresent' ? value : updatedMonthData.daysPresent);

      // Only calculate if we have valid numbers and working days is positive
      if (!isNaN(working) && !isNaN(present) && working > 0) {
        updatedMonthData.percentage = Math.round((present / working) * 100) + '%';
      } else if (value === '') {
        // Clear percentage if input is cleared
        updatedMonthData.percentage = '';
      }
    }

    onChange({
      ...data,
      attendance: {
        ...data.attendance,
        [month]: updatedMonthData
      }
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("File size is too large. Please upload an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    handleChange('photoUrl', '');
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 bg-blue-600 text-white font-bold text-lg">
        Data Entry
      </div>
      <div className="overflow-y-auto flex-1 p-4 space-y-2">
        
        {/* School Info */}
        <div className="border rounded">
          <SectionHeader title="School Information" isOpen={openSections.school} toggle={() => toggleSection('school')} />
          {openSections.school && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">School Name & Address</label>
                <input 
                  type="text" 
                  className="w-full border rounded p-2 text-sm" 
                  value={data.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Village</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.village} onChange={(e) => handleChange('village', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">State</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.state} onChange={(e) => handleChange('state', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">BRC</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.brc} onChange={(e) => handleChange('brc', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">CRC</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.crc} onChange={(e) => handleChange('crc', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Pin Code (6 digits)</label>
                <input type="text" maxLength={6} className="w-full border rounded p-2 text-sm" value={data.pinCode} onChange={(e) => handleChange('pinCode', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">UDISE Code (11 digits)</label>
                <input type="text" maxLength={11} className="w-full border rounded p-2 text-sm" value={data.udiseCode} onChange={(e) => handleChange('udiseCode', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Teacher Code</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.teacherCode} onChange={(e) => handleChange('teacherCode', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">APAAR ID</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.apaarId} onChange={(e) => handleChange('apaarId', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Student General Info */}
        <div className="border rounded">
          <SectionHeader title="General Information" isOpen={openSections.student} toggle={() => toggleSection('student')} />
          {openSections.student && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Student Name</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.studentName} onChange={(e) => handleChange('studentName', e.target.value)} />
              </div>
              
               {/* Photo Upload */}
               <div className="col-span-2 bg-gray-50 p-3 rounded border border-dashed border-gray-300">
                <label className="block text-xs font-bold mb-2">Student Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-20 bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden">
                    {data.photoUrl ? (
                      <img src={data.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] text-gray-500 text-center">No Photo</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Supported: JPG, PNG. Max 2MB.</p>
                  </div>
                   {data.photoUrl && (
                      <button onClick={removePhoto} className="text-red-500 hover:bg-red-50 p-1 rounded" title="Remove Photo">
                        <X size={16} />
                      </button>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Roll No.</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.rollNo} onChange={(e) => handleChange('rollNo', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Registration No.</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.registrationNo} onChange={(e) => handleChange('registrationNo', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Grade</label>
                <select className="w-full border rounded p-2 text-sm" value={data.grade} onChange={(e) => handleChange('grade', e.target.value)}>
                  <option value="">Select Grade</option>
                  <option value="BV1">BV1</option>
                  <option value="BV2">BV2</option>
                  <option value="BV3">BV3</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                </select>
              </div>
               <div>
                <label className="block text-xs font-bold mb-1">Section</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.section} onChange={(e) => handleChange('section', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Date of Birth</label>
                <input type="text" placeholder="DD/MM/YYYY" className="w-full border rounded p-2 text-sm" value={data.dob} onChange={(e) => handleChange('dob', e.target.value)} />
              </div>
               <div>
                <label className="block text-xs font-bold mb-1">Phone</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Address</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.address} onChange={(e) => handleChange('address', e.target.value)} />
              </div>

              {/* Family */}
              <div className="col-span-2 border-t pt-4 mt-2">
                <h4 className="font-bold text-gray-500 mb-2">Family Details</h4>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Mother/Guardian Name</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.motherName} onChange={(e) => handleChange('motherName', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Education</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.motherEducation} onChange={(e) => handleChange('motherEducation', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Occupation</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.motherOccupation} onChange={(e) => handleChange('motherOccupation', e.target.value)} />
              </div>

               <div>
                <label className="block text-xs font-bold mb-1">Father/Guardian Name</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.fatherName} onChange={(e) => handleChange('fatherName', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Education</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.fatherEducation} onChange={(e) => handleChange('fatherEducation', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Occupation</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.fatherOccupation} onChange={(e) => handleChange('fatherOccupation', e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">No. of Siblings</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.siblingsCount} onChange={(e) => handleChange('siblingsCount', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Siblings' Age</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.siblingsAge} onChange={(e) => handleChange('siblingsAge', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Mother Tongue</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.motherTongue} onChange={(e) => handleChange('motherTongue', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Medium of Instruction</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.mediumOfInstruction} onChange={(e) => handleChange('mediumOfInstruction', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Locality</label>
                <div className="flex gap-4">
                  <label className="flex items-center"><input type="radio" name="loc" checked={data.isRural === true} onChange={() => handleChange('isRural', true)} className="mr-2"/> Rural</label>
                  <label className="flex items-center"><input type="radio" name="loc" checked={data.isRural === false} onChange={() => handleChange('isRural', false)} className="mr-2"/> Urban</label>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Times fallen ill?</label>
                <input type="text" className="w-full border rounded p-2 text-sm" value={data.illnessCount} onChange={(e) => handleChange('illnessCount', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Attendance */}
        <div className="border rounded">
           <SectionHeader title="Attendance" isOpen={openSections.attendance} toggle={() => toggleSection('attendance')} />
           {openSections.attendance && (
             <div className="p-2 overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-1 border">Month</th>
                      <th className="p-1 border">Working Days</th>
                      <th className="p-1 border">Present</th>
                      <th className="p-1 border">%</th>
                      <th className="p-1 border">Reason (if low)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTHS.map(m => (
                      <tr key={m}>
                        <td className="p-1 border font-bold">{m}</td>
                        <td className="p-1 border"><input type="text" className="w-full" value={data.attendance[m].workingDays} onChange={e => handleAttendanceChange(m, 'workingDays', e.target.value)} /></td>
                         <td className="p-1 border"><input type="text" className="w-full" value={data.attendance[m].daysPresent} onChange={e => handleAttendanceChange(m, 'daysPresent', e.target.value)} /></td>
                          <td className="p-1 border"><input type="text" className="w-full" value={data.attendance[m].percentage} onChange={e => handleAttendanceChange(m, 'percentage', e.target.value)} /></td>
                           <td className="p-1 border"><input type="text" className="w-full" value={data.attendance[m].reason} onChange={e => handleAttendanceChange(m, 'reason', e.target.value)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           )}
        </div>

         {/* Interests */}
         <div className="border rounded">
           <SectionHeader title="Interests" isOpen={openSections.interests} toggle={() => toggleSection('interests')} />
           {openSections.interests && (
            <div className="p-4 grid grid-cols-2 gap-2 text-sm">
                {(Object.keys(data.interests) as Array<keyof typeof data.interests>).map(k => {
                  if (k === 'otherSpecify') return null;
                  return (
                    <label key={k} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={data.interests[k] as boolean} 
                        onChange={(e) => handleInterestChange(k, e.target.checked)}
                      />
                      <span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                  )
                })}
                <div className="col-span-2 mt-2">
                  <label className="block text-xs font-bold mb-1">Other Specify</label>
                  <input type="text" className="w-full border rounded p-2 text-sm" value={data.interests.otherSpecify} onChange={(e) => handleInterestChange('otherSpecify', e.target.value)} />
                </div>
            </div>
           )}
         </div>

      </div>
    </div>
  );
};
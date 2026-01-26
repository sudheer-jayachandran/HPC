
import React from 'react';
import { StudentData, MonthKey, RubricLevel, AttendanceData } from '../types';
import { MONTHS } from '../constants';
import { 
  ChevronDown, ChevronUp, User, Layout, MessageSquare, ClipboardCheck, 
  Users, Heart, Calendar, Target, CheckCircle2, UserCircle, Home, 
  School, Hash, Phone, MapPin, Info, BookOpen, Star 
} from 'lucide-react';

interface EditorProps {
  data: StudentData;
  onChange: (data: StudentData) => void;
}

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

const SectionHeader = ({ title, isOpen, toggle, icon, status }: { title: string, isOpen: boolean, toggle: () => void, icon?: React.ReactNode, status: 'complete' | 'partial' | 'empty' }) => {
  const statusColors = {
    complete: 'bg-green-500',
    partial: 'bg-yellow-500',
    empty: 'bg-gray-300'
  };

  return (
    <button 
      onClick={toggle}
      className={`flex items-center justify-between w-full p-3 border-b transition-colors text-left ${isOpen ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]} shadow-sm`} title={`Status: ${status}`} />
        {icon && <span className="text-gray-500">{icon}</span>}
        <span className="font-bold text-gray-700 text-sm">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {status === 'complete' && <CheckCircle2 size={14} className="text-green-600" />}
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </div>
    </button>
  );
};

export const Editor: React.FC<EditorProps> = ({ data, onChange }) => {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    school: false,
    student: true,
    family: false,
    attendance: false,
    interests: false,
    page2: false,
    page3: false,
    page4: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getSectionStatus = (key: string): 'complete' | 'partial' | 'empty' => {
    let required: string[] = [];
    let sectionObj: any = data;

    switch(key) {
      case 'school': required = ['schoolName', 'udiseCode', 'pinCode']; break;
      case 'student': required = ['studentName', 'grade', 'section', 'dob']; break;
      case 'family': required = ['motherName', 'fatherName', 'motherTongue']; break;
      case 'page2': required = ['ambition', 'friends', 'mePhotoUrl', 'familyPhotoUrl']; break;
      case 'page3': 
        const d1 = data.partB.domain1;
        const d1Filled = [d1.curricularGoals, d1.competencies, d1.activity, d1.assessmentQuestions, d1.rubric.awareness, d1.rubric.sensitivity, d1.rubric.creativity].filter(Boolean).length;
        if (d1Filled >= 7) return 'complete';
        return d1Filled > 0 ? 'partial' : 'empty';
      case 'page4':
        const p4 = data.page4;
        const p4Filled = [
          p4.teacherFeedback.proficiencyLevel,
          p4.selfAssessment.liked,
          p4.peerAssessment.liked,
          p4.parentObservation.remarks
        ].filter(Boolean).length;
        if (p4Filled >= 4) return 'complete';
        return p4Filled > 0 ? 'partial' : 'empty';
      case 'attendance':
        const hasData = (Object.values(data.attendance) as AttendanceData[]).some(m => m.workingDays || m.daysPresent);
        return hasData ? 'complete' : 'empty';
      case 'interests':
        const hasInterest = Object.values(data.interests).some(v => v === true);
        return hasInterest ? 'complete' : 'empty';
      default: return 'empty';
    }

    const filledCount = required.filter(field => !!(sectionObj as any)[field]).length;
    if (filledCount === required.length) return 'complete';
    return filledCount > 0 ? 'partial' : 'empty';
  };

  const totalCompletion = () => {
    const sections = ['school', 'student', 'family', 'attendance', 'interests', 'page2', 'page3', 'page4'];
    const complete = sections.filter(s => getSectionStatus(s) === 'complete').length;
    return Math.round((complete / sections.length) * 100);
  };

  const handleChange = (field: keyof StudentData, value: any) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
  };

  const handleInterestChange = (field: keyof typeof data.interests, value: any) => {
    onChange({ ...data, interests: { ...data.interests, [field]: value } });
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

  const handlePartBChange = (field: string, value: any) => {
    onChange({ ...data, partB: { ...data.partB, domain1: { ...data.partB.domain1, [field]: value } } });
  };

  const handleRubricChange = (ability: 'awareness' | 'sensitivity' | 'creativity', level: RubricLevel) => {
    onChange({
      ...data,
      partB: {
        ...data.partB,
        domain1: {
          ...data.partB.domain1,
          rubric: {
            ...data.partB.domain1.rubric,
            [ability]: data.partB.domain1.rubric[ability] === level ? '' : level
          }
        }
      }
    });
  };

  const handlePage4Change = (section: keyof typeof data.page4, field: string, value: any) => {
    onChange({ ...data, page4: { ...data.page4, [section]: { ...data.page4[section], [field]: value } } });
  };

  const togglePage4Array = (section: 'selfAssessment' | 'peerAssessment' | 'parentObservation', field: string, value: string) => {
    const currentArr = (data.page4[section] as any)[field] as string[];
    const newArr = currentArr.includes(value) ? currentArr.filter(v => v !== value) : [...currentArr, value];
    handlePage4Change(section, field, newArr);
  };

  const handlePhotoUpload = (field: 'photoUrl' | 'familyPhotoUrl' | 'mePhotoUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange(field, reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const SmileyToggle = ({ label, value, onSelect }: { label: string, value: string, onSelect: (v: string) => void }) => (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-gray-500 uppercase">{label}</span>
      <div className="flex gap-2">
        {[
          { id: 'yes', icon: '😊' },
          { id: 'no', icon: '😐' },
          { id: 'dnk', icon: '🤔' }
        ].map(s => (
          <button 
            key={s.id}
            type="button"
            onClick={() => onSelect(value === s.id ? '' : s.id)}
            className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center text-xl ${value === s.id ? 'bg-orange-100 border-orange-500 scale-110 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-50 grayscale'}`}
          >
            {s.icon}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full flex flex-col border border-gray-200">
      <div className="p-3 bg-indigo-600 text-white flex flex-col gap-2">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest"><User size={16} /> Data Entry</div>
           <div className="text-[10px] font-bold bg-indigo-500 px-2 py-0.5 rounded shadow-sm">{totalCompletion()}% Form Complete</div>
        </div>
        <div className="w-full bg-indigo-800 h-1.5 rounded-full overflow-hidden">
           <div className="bg-green-400 h-full transition-all duration-500 ease-out" style={{ width: `${totalCompletion()}%` }} />
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 p-3 space-y-2 bg-gray-50/50">
        
        {/* School Identification */}
        <div className="border rounded bg-white shadow-sm overflow-hidden">
          <SectionHeader title="School Identification" status={getSectionStatus('school')} isOpen={openSections.school} toggle={() => toggleSection('school')} icon={<School size={14} />} />
          {openSections.school && (
            <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2 md:col-span-4"><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">School Name</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.schoolName} onChange={(e) => handleChange('schoolName', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Village</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.village} onChange={(e) => handleChange('village', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">BRC</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.brc} onChange={(e) => handleChange('brc', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">CRC</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.crc} onChange={(e) => handleChange('crc', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">State</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.state} onChange={(e) => handleChange('state', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Pin Code</label><input type="text" maxLength={6} className="w-full border rounded p-2 text-sm bg-gray-50" value={data.pinCode} onChange={(e) => handleChange('pinCode', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">UDISE Code</label><input type="text" maxLength={11} className="w-full border rounded p-2 text-sm bg-gray-50" value={data.udiseCode} onChange={(e) => handleChange('udiseCode', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Teacher Code</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.teacherCode} onChange={(e) => handleChange('teacherCode', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">APAAR ID</label><input type="text" className="w-full border rounded p-2 text-sm bg-gray-50" value={data.apaarId} onChange={(e) => handleChange('apaarId', e.target.value)} /></div>
            </div>
          )}
        </div>

        {/* Student Details */}
        <div className="border rounded bg-white shadow-sm overflow-hidden">
          <SectionHeader title="Student Details" status={getSectionStatus('student')} isOpen={openSections.student} toggle={() => toggleSection('student')} />
          {openSections.student && (
            <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="col-span-2 md:col-span-3"><label className="block text-[10px] font-black uppercase text-indigo-500 mb-1">Student Name (Required)</label><input type="text" className="w-full border-2 border-indigo-100 rounded-lg p-2 text-sm font-bold" value={data.studentName} onChange={(e) => handleChange('studentName', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Roll No.</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.rollNo} onChange={(e) => handleChange('rollNo', e.target.value)} /></div>
              <div className="col-span-1 md:col-span-2"><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Registration No.</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.registrationNo} onChange={(e) => handleChange('registrationNo', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Grade</label><select className="w-full border rounded p-2 text-sm bg-white" value={data.grade} onChange={(e) => handleChange('grade', e.target.value as any)}><option value="">Select</option><option value="BV1">BV1</option><option value="BV2">BV2</option><option value="BV3">BV3</option><option value="Grade 1">Grade 1</option><option value="Grade 2">Grade 2</option></select></div>
              <div>
                <label className="block text-[10px] font-black uppercase text-indigo-500 mb-1">Section</label>
                <select className="w-full border-2 border-indigo-500/20 rounded p-2 text-sm font-bold bg-white outline-none focus:border-indigo-500/50" value={data.section} onChange={(e) => handleChange('section', e.target.value)}>
                  <option value="">Select</option>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Age</label><input type="number" className="w-full border rounded p-2 text-sm" value={data.age} onChange={(e) => handleChange('age', e.target.value)} /></div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Date of Birth</label><input type="date" className="w-full border rounded p-2 text-sm" value={data.dob} onChange={(e) => handleChange('dob', e.target.value)} /></div>
              <div className="col-span-2"><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Phone</label><input type="tel" className="w-full border rounded p-2 text-sm" value={data.phone} onChange={(e) => handleChange('phone', e.target.value)} /></div>
              <div className="col-span-2 md:col-span-3"><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Address</label><textarea className="w-full border rounded p-2 text-sm" rows={2} value={data.address} onChange={(e) => handleChange('address', e.target.value)} /></div>
              <div className="col-span-2 md:col-span-3 bg-gray-50 p-2 rounded border border-dashed border-gray-300">
                <label className="block text-[10px] font-black mb-1 uppercase text-gray-500">Profile Photo</label>
                <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload('photoUrl', e)} className="block w-full text-[10px] text-gray-500" />
              </div>
            </div>
          )}
        </div>

        {/* Family & Caregiver - Expanded */}
        <div className="border rounded bg-white shadow-sm overflow-hidden border-teal-100">
          <SectionHeader title="Family & Caregiver (Page 1 Details)" status={getSectionStatus('family')} isOpen={openSections.family} toggle={() => toggleSection('family')} icon={<Users size={14} className="text-teal-600" />} />
          {openSections.family && (
            <div className="p-3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                   <h4 className="text-[10px] font-black uppercase text-teal-600 border-b">Mother Details</h4>
                   <div><label className="block text-[9px] font-black uppercase text-gray-400">Name</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.motherName} onChange={(e) => handleChange('motherName', e.target.value)} /></div>
                   <div><label className="block text-[9px] font-black uppercase text-gray-400">Education</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.motherEducation} onChange={(e) => handleChange('motherEducation', e.target.value)} /></div>
                   <div><label className="block text-[9px] font-black uppercase text-gray-400">Occupation</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.motherOccupation} onChange={(e) => handleChange('motherOccupation', e.target.value)} /></div>
                </div>
                <div className="space-y-2">
                   <h4 className="text-[10px] font-black uppercase text-teal-600 border-b">Father Details</h4>
                   <div><label className="block text-[9px] font-black uppercase text-gray-400">Name</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.fatherName} onChange={(e) => handleChange('fatherName', e.target.value)} /></div>
                   <div><label className="block text-[9px] font-black uppercase text-gray-400">Education</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.fatherEducation} onChange={(e) => handleChange('fatherEducation', e.target.value)} /></div>
                   <div><label className="block text-[9px] font-black uppercase text-gray-400">Occupation</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.fatherOccupation} onChange={(e) => handleChange('fatherOccupation', e.target.value)} /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t pt-3">
                 <div><label className="block text-[9px] font-black uppercase text-gray-400">Siblings Count</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.siblingsCount} onChange={(e) => handleChange('siblingsCount', e.target.value)} /></div>
                 <div><label className="block text-[9px] font-black uppercase text-gray-400">Siblings Age</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.siblingsAge} onChange={(e) => handleChange('siblingsAge', e.target.value)} /></div>
                 <div><label className="block text-[9px] font-black uppercase text-gray-400">Mother Tongue</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.motherTongue} onChange={(e) => handleChange('motherTongue', e.target.value)} /></div>
                 <div><label className="block text-[9px] font-black uppercase text-gray-400">Medium of Inst.</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.mediumOfInstruction} onChange={(e) => handleChange('mediumOfInstruction', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Rural / Urban</label>
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                       <button onClick={() => handleChange('isRural', true)} className={`flex-1 py-1 text-[10px] font-bold rounded ${data.isRural === true ? 'bg-teal-600 text-white' : 'text-gray-500'}`}>Rural</button>
                       <button onClick={() => handleChange('isRural', false)} className={`flex-1 py-1 text-[10px] font-bold rounded ${data.isRural === false ? 'bg-teal-600 text-white' : 'text-gray-500'}`}>Urban</button>
                    </div>
                 </div>
                 <div><label className="block text-[9px] font-black uppercase text-gray-400">Illness Count</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.illnessCount} onChange={(e) => handleChange('illnessCount', e.target.value)} placeholder="e.g. Twice a year" /></div>
              </div>
            </div>
          )}
        </div>

        {/* Attendance */}
        <div className="border rounded bg-white shadow-sm overflow-hidden">
          <SectionHeader title="Monthly Attendance" status={getSectionStatus('attendance')} isOpen={openSections.attendance} toggle={() => toggleSection('attendance')} icon={<Calendar size={14} />} />
          {openSections.attendance && (
            <div className="p-3 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50"><th className="border p-1 text-[9px] uppercase font-black text-gray-400">Month</th><th className="border p-1 text-[9px] uppercase font-black">Work</th><th className="border p-1 text-[9px] uppercase font-black">Pres</th></tr></thead>
                  <tbody>{MONTHS.map(month => (
                    <tr key={month}>
                      <td className="border p-1 font-bold">{month}</td>
                      <td className="border p-1"><input type="text" className="w-full p-1 text-center" value={data.attendance[month].workingDays} onChange={(e) => handleAttendanceChange(month, 'workingDays', e.target.value)} /></td>
                      <td className="border p-1"><input type="text" className="w-full p-1 text-center" value={data.attendance[month].daysPresent} onChange={(e) => handleAttendanceChange(month, 'daysPresent', e.target.value)} /></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Reason for Low Attendance (if any)</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.attendanceReason} onChange={(e) => handleChange('attendanceReason', e.target.value)} /></div>
            </div>
          )}
        </div>

        {/* Student Interests */}
        <div className="border rounded bg-white shadow-sm overflow-hidden">
          <SectionHeader title="Student Interests" status={getSectionStatus('interests')} isOpen={openSections.interests} toggle={() => toggleSection('interests')} icon={<Heart size={14} />} />
          {openSections.interests && (
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(data.interests) as Array<keyof StudentData['interests'] & string>).map(key => {
                  if (key === 'otherSpecify') return null;
                  return (
                    <label key={key} className="flex items-center gap-2 text-xs cursor-pointer p-1.5 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100">
                      <input type="checkbox" checked={!!data.interests[key]} onChange={(e) => handleInterestChange(key, e.target.checked)} />
                      {INTEREST_LABELS[key]}
                    </label>
                  );
                })}
              </div>
              <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Specify "Other" Interest</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.interests.otherSpecify} onChange={(e) => handleInterestChange('otherSpecify', e.target.value)} /></div>
            </div>
          )}
        </div>

        {/* Page 2: Me and My Surroundings */}
        <div className="border rounded bg-white shadow-sm overflow-hidden">
          <SectionHeader title="Me & My Surroundings (Page 2)" status={getSectionStatus('page2')} isOpen={openSections.page2} toggle={() => toggleSection('page2')} icon={<Users size={14} />} />
          {openSections.page2 && (
            <div className="p-3 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2 rounded border border-dashed border-gray-300">
                  <label className="block text-[10px] font-black mb-1 uppercase text-gray-500">Me Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload('mePhotoUrl', e)} className="block w-full text-[9px] text-gray-400" />
                </div>
                <div className="bg-gray-50 p-2 rounded border border-dashed border-gray-300">
                  <label className="block text-[10px] font-black mb-1 uppercase text-gray-500">Family Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload('familyPhotoUrl', e)} className="block w-full text-[9px] text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Ambition</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.ambition} onChange={(e) => handleChange('ambition', e.target.value)} /></div>
                <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Friends (Comma separated)</label><input type="text" className="w-full border rounded p-2 text-sm" value={data.friends} onChange={(e) => handleChange('friends', e.target.value)} /></div>
              </div>
              
              <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 space-y-3">
                 <h4 className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2"><Star size={12}/> My Favourites</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div><label className="block text-[9px] font-black uppercase text-gray-400">Colour</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.favColour} onChange={(e) => handleChange('favColour', e.target.value)} /></div>
                    <div><label className="block text-[9px] font-black uppercase text-gray-400">Food</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.favFood} onChange={(e) => handleChange('favFood', e.target.value)} /></div>
                    <div><label className="block text-[9px] font-black uppercase text-gray-400">Animal</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.favAnimal} onChange={(e) => handleChange('favAnimal', e.target.value)} /></div>
                    <div><label className="block text-[9px] font-black uppercase text-gray-400">Flower</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.favFlower} onChange={(e) => handleChange('favFlower', e.target.value)} /></div>
                    <div><label className="block text-[9px] font-black uppercase text-gray-400">Sport</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.favSport} onChange={(e) => handleChange('favSport', e.target.value)} /></div>
                    <div><label className="block text-[9px] font-black uppercase text-gray-400">Subject</label><input type="text" className="w-full border rounded p-1.5 text-xs" value={data.favSubject} onChange={(e) => handleChange('favSubject', e.target.value)} /></div>
                 </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Page 3: Domain 1 */}
        <div className="border rounded bg-white shadow-sm overflow-hidden border-indigo-200">
          <SectionHeader title="Page 3: Domain 1" status={getSectionStatus('page3')} isOpen={openSections.page3} toggle={() => toggleSection('page3')} icon={<Layout size={14} className="text-indigo-500" />} />
          {openSections.page3 && (
            <div className="p-3 space-y-3">
               <div><label className="block text-[10px] font-black text-indigo-500 uppercase">Curricular Goals</label><textarea className="w-full border rounded p-2 text-sm bg-indigo-50/10" rows={2} value={data.partB.domain1.curricularGoals} onChange={(e) => handlePartBChange('curricularGoals', e.target.value)} /></div>
               <div><label className="block text-[10px] font-black text-indigo-500 uppercase">Competencies</label><textarea className="w-full border rounded p-2 text-sm bg-indigo-50/10" rows={2} value={data.partB.domain1.competencies} onChange={(e) => handlePartBChange('competencies', e.target.value)} /></div>
               <div><label className="block text-[10px] font-black text-gray-400 uppercase">Activity</label><textarea className="w-full border rounded p-2 text-sm" rows={2} value={data.partB.domain1.activity} onChange={(e) => handlePartBChange('activity', e.target.value)} /></div>
               <div><label className="block text-[10px] font-black text-indigo-500 uppercase">Assessment Questions</label><textarea className="w-full border rounded p-2 text-sm bg-indigo-50/10" rows={2} value={data.partB.domain1.assessmentQuestions} onChange={(e) => handlePartBChange('assessmentQuestions', e.target.value)} /></div>
               <div className="bg-orange-50 p-2 rounded border border-orange-100 space-y-2">
                  {['awareness', 'sensitivity', 'creativity'].map((ability) => (
                    <div key={ability} className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-600 uppercase">{ability}</span>
                      <div className="flex gap-1">
                        {['Stream', 'Mountain', 'Sky'].map((lvl) => (
                          <button key={lvl} type="button" onClick={() => handleRubricChange(ability as any, lvl as RubricLevel)} className={`px-3 py-0.5 text-[9px] font-black rounded-full border ${data.partB.domain1.rubric[ability as keyof typeof data.partB.domain1.rubric] === lvl ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-orange-200 text-orange-600'}`}>{lvl}</button>
                        ))}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Page 4: Feedback & Assessment */}
        <div className="border rounded bg-white shadow-sm overflow-hidden border-orange-200">
            <SectionHeader title="Page 4: Feedback & Assessment" status={getSectionStatus('page4')} isOpen={openSections.page4} toggle={() => toggleSection('page4')} icon={<MessageSquare size={14} className="text-orange-500" />} />
            {openSections.page4 && (
                <div className="p-3 space-y-6">
                    {/* Teacher Feedback */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-indigo-600 font-black text-[11px] uppercase"><ClipboardCheck size={14}/> Teacher Feedback</div>
                      <div className="flex gap-1.5">
                          {['Stream', 'Mountain', 'Sky'].map(lvl => (
                              <button key={lvl} type="button" onClick={() => handlePage4Change('teacherFeedback', 'proficiencyLevel', lvl as RubricLevel)} className={`flex-1 py-1 text-[10px] font-bold rounded-full border-2 transition-all ${data.page4.teacherFeedback.proficiencyLevel === lvl ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-indigo-100 text-indigo-400'}`}>{lvl}</button>
                          ))}
                      </div>
                      <textarea placeholder="Teacher's observational notes..." className="w-full border rounded p-2 text-sm bg-gray-50" rows={2} value={data.page4.teacherFeedback.observationalNotes} onChange={(e) => handlePage4Change('teacherFeedback', 'observationalNotes', e.target.value)} />
                    </div>

                    {/* Self Assessment */}
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center gap-2 text-green-600 font-black text-[11px] uppercase"><UserCircle size={14}/> Self Assessment</div>
                      <div className="grid grid-cols-2 gap-4">
                        <SmileyToggle label="I liked this" value={data.page4.selfAssessment.liked} onSelect={(v) => handlePage4Change('selfAssessment', 'liked', v)} />
                        <SmileyToggle label="I found it easy" value={data.page4.selfAssessment.easy} onSelect={(v) => handlePage4Change('selfAssessment', 'easy', v)} />
                      </div>
                      <div className="bg-green-50/50 p-2 rounded-lg border border-green-100">
                        <span className="text-[10px] font-bold text-green-700 uppercase block mb-2">I needed...</span>
                        <div className="flex flex-wrap gap-2">
                          {['Classmate', 'teacher', 'books', 'computer', 'none'].map(res => (
                            <label key={res} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 cursor-pointer bg-white px-2 py-1 rounded border hover:border-green-300">
                              <input type="checkbox" checked={data.page4.selfAssessment.needs.includes(res)} onChange={() => togglePage4Array('selfAssessment', 'needs', res)} />
                              {res}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Peer Assessment */}
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center gap-2 text-blue-600 font-black text-[11px] uppercase"><Users size={14}/> Peer Assessment</div>
                      <div className="grid grid-cols-2 gap-4">
                        <SmileyToggle label="Peer liked this" value={data.page4.peerAssessment.liked} onSelect={(v) => handlePage4Change('peerAssessment', 'liked', v)} />
                        <SmileyToggle label="Peer found it easy" value={data.page4.peerAssessment.easy} onSelect={(v) => handlePage4Change('peerAssessment', 'easy', v)} />
                      </div>
                      <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-700 uppercase block mb-2">Peer needed...</span>
                        <div className="flex flex-wrap gap-2">
                          {['Classmate', 'teacher', 'books', 'computer', 'none'].map(res => (
                            <label key={res} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 cursor-pointer bg-white px-2 py-1 rounded border hover:border-blue-300">
                              <input type="checkbox" checked={data.page4.peerAssessment.needs.includes(res)} onChange={() => togglePage4Array('peerAssessment', 'needs', res)} />
                              {res}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Parent Observation */}
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center gap-2 text-orange-600 font-black text-[11px] uppercase"><Home size={14}/> Parent Observation</div>
                      <div className="bg-orange-50/50 p-2 rounded-lg border border-orange-100">
                        <span className="text-[10px] font-bold text-orange-700 uppercase block mb-2">Resources at home</span>
                        <div className="flex flex-wrap gap-2">
                          {['books/magazines', 'newspapers', 'toys/games/sports', 'phone/computer', 'internet', 'public broadcast system', 'resources for CWSN'].map(res => (
                            <label key={res} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 cursor-pointer bg-white px-2 py-1 rounded border hover:border-orange-300">
                              <input type="checkbox" checked={data.page4.parentObservation.resources.includes(res)} onChange={() => togglePage4Array('parentObservation', 'resources', res)} />
                              {res}
                            </label>
                          ))}
                        </div>
                        <div className="mt-2"><label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Other (specify)</label><input type="text" className="w-full border rounded p-1.5 text-xs bg-white" value={data.page4.parentObservation.otherResource} onChange={(e) => handlePage4Change('parentObservation', 'otherResource', e.target.value)} /></div>
                      </div>
                      <textarea placeholder="Parent/Guardian comments..." className="w-full border rounded p-2 text-sm bg-gray-50" rows={3} value={data.page4.parentObservation.remarks} onChange={(e) => handlePage4Change('parentObservation', 'remarks', e.target.value)} />
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

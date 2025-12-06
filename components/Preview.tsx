import React from 'react';
import { StudentData } from '../types';
import { MONTHS } from '../constants';

interface PreviewProps {
  data: StudentData;
}

export const Preview: React.FC<PreviewProps> = ({ data }) => {
  // Utility for drawing boxes for codes (UDISE, Pin)
  const CodeBoxes = ({ count, value }: { count: number, value: string }) => {
    return (
      <div className="flex border border-black h-6 bg-white">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-5 border-r border-black last:border-r-0 flex items-center justify-center text-xs font-bold text-black">
            {value[i] || ''}
          </div>
        ))}
      </div>
    );
  };

  // Specific Checkbox for the Grade section (Black Rectangle)
  const GradeBox = ({ checked, label }: { checked: boolean, label: string }) => (
    <div className="flex items-center mr-3">
      <span className="mr-1 text-xs font-bold text-black whitespace-nowrap">{label}</span>
      <div className="w-7 h-5 border border-black flex items-center justify-center bg-white">
        {checked && <span className="text-black font-bold text-base leading-none mb-1">✓</span>}
      </div>
    </div>
  );

  // Specific Checkbox for Interests (Orange Square)
  const InterestBox = ({ checked, label, className = "" }: { checked: boolean, label: string, className?: string }) => (
    <div className={`flex items-center ${className}`}>
      <span className="text-[11px] font-bold mr-1 whitespace-nowrap leading-none text-black">{label}</span>
      <div className="w-4 h-4 border border-[#E36C0A] flex items-center justify-center bg-white flex-shrink-0">
        {checked && <span className="text-[#E36C0A] font-bold text-base leading-none mb-1">✓</span>}
      </div>
    </div>
  );

  const LineInput = ({ value, label, width = 'w-full', labelClass="text-sm" }: { value: string, label?: string, width?: string, labelClass?: string }) => (
    <div className={`flex items-end ${width} mb-[2px]`}>
      {label && <span className={`whitespace-nowrap mr-2 font-medium text-black ${labelClass}`}>{label}</span>}
      <div className="border-b border-black border-dotted flex-1 text-sm font-bold pl-1 h-5 overflow-hidden whitespace-nowrap text-black leading-none pb-0.5">
        {value}
      </div>
    </div>
  );

  return (
    <div id="print-area" className="w-[210mm] h-[297mm] bg-white px-8 py-8 mx-auto shadow-2xl relative text-black leading-tight overflow-hidden font-serif box-border flex flex-col">
        {/* Header */}
        <div className="text-center mb-3">
            <h2 className="text-[#E36C0A] font-bold text-xl tracking-wide">PART-A (1)</h2>
        </div>

        {/* School Info */}
        <div className="space-y-[2px] mb-3">
            <LineInput label="Name and Address of the School:" value={data.schoolName} />
            
            <div className="flex justify-between gap-4">
                <LineInput label="Village:" value={data.village} width="w-[35%]"/>
                <LineInput label="BRC:" value={data.brc} width="w-[30%]"/>
                <LineInput label="CRC:" value={data.crc} width="w-[35%]"/>
            </div>

            <div className="flex items-center justify-between mt-1">
                <LineInput label="State:" value={data.state} width="w-1/2" />
                <div className="flex items-center gap-2">
                    <span className="font-medium text-black text-sm">Pin Code:</span>
                    <CodeBoxes count={6} value={data.pinCode} />
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-black text-sm">UDISE Code:</span>
                    <CodeBoxes count={11} value={data.udiseCode} />
                </div>
                <div className="flex items-center flex-1">
                     <LineInput label="Teacher Code:" value={data.teacherCode} />
                </div>
            </div>
             <LineInput label="APAAR ID:" value={data.apaarId} />
        </div>

        {/* General Info Header */}
        <div className="text-center my-3">
            <h3 className="text-[#E36C0A] font-bold text-lg border-b border-[#E36C0A] inline-block px-4 pb-0.5 leading-tight">GENERAL INFORMATION</h3>
            <p className="text-[11px] font-bold mt-0.5 text-black">(To be filled by the teacher in consultation with caregiver/parent)</p>
        </div>

        {/* Student Details Grid */}
        <div className="flex gap-4 mb-2">
            <div className="flex-1 space-y-[2px]">
                <LineInput label="Student Name:" value={data.studentName} />
                
                <div className="flex justify-between gap-2">
                    <LineInput label="Roll No.:" value={data.rollNo} width="w-1/3"/>
                    <LineInput label="Registration No.:" value={data.registrationNo} width="w-2/3"/>
                </div>

                <div className="flex items-center justify-start flex-wrap gap-1 py-1">
                    <span className="text-sm mr-1 font-bold text-black">Grade:</span>
                    <GradeBox label="BV1" checked={data.grade === 'BV1'} />
                    <GradeBox label="BV2" checked={data.grade === 'BV2'} />
                    <GradeBox label="BV3" checked={data.grade === 'BV3'} />
                    <GradeBox label="Grade 1" checked={data.grade === 'Grade 1'} />
                    <GradeBox label="Grade 2" checked={data.grade === 'Grade 2'} />
                </div>

                <div className="flex gap-2">
                    <LineInput label="Section:" value={data.section} width="w-[40%]"/>
                    <LineInput label="Date of Birth:" value={data.dob} width="w-[40%]"/>
                    <LineInput label="Age:" value={data.age} width="w-[20%]"/>
                </div>
                
                {/* Address Section with wrapping and 2-line layout */}
                <div className="relative mt-[2px] w-full">
                    {/* Background Lines */}
                    <div className="absolute inset-0 flex flex-col pointer-events-none">
                         <div className="h-5 border-b border-black border-dotted w-full"></div>
                         <div className="h-5 border-b border-black border-dotted w-full"></div>
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-0 min-h-[2.5rem]">
                        <div className="text-sm font-bold text-black leading-5 break-words">
                             <span className="font-medium text-black mr-2 font-normal">Address:</span>
                             {data.address}
                        </div>
                    </div>
                    
                    {/* Phone Overlay - Bottom Right of 2nd line */}
                    <div className="absolute right-0 top-5 h-5 flex items-end bg-white pl-2">
                         <span className="font-medium text-black mr-2 text-sm">Phone:</span>
                         <div className="font-bold text-black text-sm leading-none mb-0.5 min-w-[3rem]">
                             {data.phone}
                         </div>
                    </div>
                </div>
            </div>

            {/* Photo Box */}
            <div className="w-32 h-40 border border-black flex flex-col items-center justify-center bg-white flex-shrink-0 shadow-sm mt-0">
                {data.photoUrl ? (
                    <img src={data.photoUrl} className="w-full h-full object-cover"/>
                ) : (
                    <span className="text-sm text-center mt-16 font-serif">Photograph</span>
                )}
            </div>
        </div>

        {/* Family Details */}
        <div className="space-y-[3px] mb-3">
             <div className="flex gap-4">
                 <LineInput label="Mother/Guardian Name:" value={data.motherName} width="w-1/2"/>
             </div>
             <div className="flex gap-4">
                 <LineInput label="Mother/Guardian Education:" value={data.motherEducation} width="w-1/2"/>
                 <LineInput label="Mother/Guardian Occupation:" value={data.motherOccupation} width="w-1/2"/>
             </div>
             <div className="flex gap-4">
                 <LineInput label="Father/Guardian Name:" value={data.fatherName} width="w-1/2"/>
             </div>
             <div className="flex gap-4">
                 <LineInput label="Father/Guardian Education:" value={data.fatherEducation} width="w-1/2"/>
                 <LineInput label="Father/Guardian Occupation:" value={data.fatherOccupation} width="w-1/2"/>
             </div>

             <div className="flex gap-4 items-center">
                 <LineInput label="Number of siblings:" value={data.siblingsCount} width="w-[40%]"/>
                 <LineInput label="Siblings' age:" value={data.siblingsAge} width="w-[60%]"/>
             </div>
             
             <div className="flex gap-4 items-center">
                 <LineInput label="Mother Tongue:" value={data.motherTongue} width="w-1/2"/>
                 <LineInput label="Medium of Instruction:" value={data.mediumOfInstruction} width="w-1/2"/>
             </div>

             <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-black">Rural/Urban:</span>
                <div className="flex-1 border-b border-black border-dotted h-5 flex items-center">
                    {data.isRural !== null && (
                         <span className="font-bold ml-2 text-black text-sm">{data.isRural ? 'Rural' : 'Urban'}</span>
                    )}
                </div>
             </div>
             <LineInput label="How many times the student has fallen ill?:" value={data.illnessCount} />
        </div>

        {/* Attendance Table */}
        <div className="mb-3">
            <h4 className="text-center text-[#E36C0A] font-bold text-sm mb-0.5 uppercase tracking-wider">Attendance</h4>
            <table className="w-full border-collapse border border-white table-fixed">
                <thead>
                    <tr className="bg-[#E36C0A] text-white text-[10px]">
                        <th className="border border-white py-[2px] px-1 text-left w-[18%] font-bold uppercase pl-2">MONTHS</th>
                        {MONTHS.map(m => <th key={m} className="border border-white py-[2px] text-center font-bold">{m}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-[#FEF5E7]">
                    <tr>
                        <td className="border border-orange-300 px-2 py-[2px] text-[10px] font-bold bg-[#FCE4D6] text-black leading-tight">No. of<br/>Working Days</td>
                        {MONTHS.map(m => <td key={m} className="border border-orange-300 px-[2px] text-center text-[10px] h-6 text-black align-middle">{data.attendance[m].workingDays}</td>)}
                    </tr>
                    <tr>
                        <td className="border border-orange-300 px-2 py-[2px] text-[10px] font-bold bg-[#FCE4D6] text-black leading-tight">No. of Days<br/>Present</td>
                         {MONTHS.map(m => <td key={m} className="border border-orange-300 px-[2px] text-center text-[10px] h-6 text-black align-middle">{data.attendance[m].daysPresent}</td>)}
                    </tr>
                    <tr>
                         <td className="border border-orange-300 px-2 py-[2px] text-[10px] font-bold bg-[#FCE4D6] text-black leading-tight">% of<br/>Attendance</td>
                         {MONTHS.map(m => <td key={m} className="border border-orange-300 px-[2px] text-center text-[10px] h-6 text-black align-middle">{data.attendance[m].percentage}</td>)}
                    </tr>
                    <tr>
                         <td className="border border-orange-300 px-2 py-[2px] text-[9px] font-bold bg-[#FCE4D6] leading-tight text-black">If attendance<br/>is low then<br/>reasons thereof</td>
                         <td colSpan={12} className="border border-orange-300 px-2 text-left text-[9px] align-middle h-8 text-black leading-none">
                             {data.attendanceReason}
                         </td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* Interests Section */}
        {/* Removed mt-auto here to allow it to sit directly below the table */}
        <div className="mt-2">
            <h4 className="text-[#E36C0A] font-bold text-sm mb-0.5">INTEREST (I (the student) am interested in)*:</h4>
            <div className="bg-[#FFF0E0] p-3 border border-orange-200/50 flex flex-col gap-3">
                
                {/* Row 1 */}
                <div className="flex justify-between items-center">
                    <InterestBox label="Reading" checked={data.interests.reading} className="w-1/4" />
                    <InterestBox label="Dancing or Singing or Playing a musical instrument" checked={data.interests.music} className="w-1/2 justify-center" />
                    <InterestBox label="Sport or Games" checked={data.interests.sports} className="w-1/4 justify-end" />
                </div>

                {/* Row 2 */}
                <div className="flex justify-between items-center">
                    <InterestBox label="Creative writing" checked={data.interests.creativeWriting} />
                    <InterestBox label="Gardening" checked={data.interests.gardening} />
                    <InterestBox label="Yoga" checked={data.interests.yoga} />
                    <InterestBox label="Art" checked={data.interests.art} />
                    <InterestBox label="Craft" checked={data.interests.craft} />
                    <InterestBox label="Cooking" checked={data.interests.cooking} />
                </div>

                {/* Row 3 - Chores */}
                <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-black">Regular chores at home with significant others (father, mother, guardian, sibling, etc.)</span>
                    <div className="w-4 h-4 border border-[#E36C0A] flex items-center justify-center bg-white flex-shrink-0">
                        {data.interests.chores && <span className="text-[#E36C0A] font-bold text-base leading-none mb-1">✓</span>}
                    </div>
                </div>

                {/* Row 4 - Other with Floating Layout for Text Wrapping */}
                <div className="relative mt-2">
                    {/* Background Dotted Lines (3 lines fixed) */}
                    <div className="absolute inset-0 flex flex-col pt-1">
                         <div className="h-6 border-b border-black border-dotted w-full"></div>
                         <div className="h-6 border-b border-black border-dotted w-full"></div>
                         <div className="h-6 border-b border-black border-dotted w-full"></div>
                    </div>

                    {/* Foreground Content */}
                    <div className="relative z-10 text-xs font-bold text-black leading-6 min-h-[4.5rem]">
                        {/* Float the label left so text wraps around it */}
                        <div className="float-left flex items-center h-6 mr-2">
                            <InterestBox label="Other" checked={data.interests.other} />
                            <span className="text-[11px] font-bold ml-2">Please specify</span>
                        </div>
                        {/* The text content */}
                        <span className="break-words decoration-slice">{data.interests.otherSpecify}</span>
                    </div>
                </div>

            </div>
             <p className="text-[10px] mt-1 ml-1 font-medium text-black">* May choose more than one option</p>
        </div>

        {/* Footer for Page Number */}
        <div className="mt-auto text-center text-xs font-bold text-black pb-2">
            1
        </div>

    </div>
  );
};

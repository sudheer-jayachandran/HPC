
import React from 'react';
import { StudentData } from '../types';

interface PreviewProps {
  data: StudentData;
}

export const PreviewPage4: React.FC<PreviewProps> = ({ data }) => {
  // Use type assertion to ensure p4 has the correct structure for StudentData['page4'] and avoid 'any' inference
  const p4 = (data.page4 || {
    teacherFeedback: { observationalNotes: '', proficiencyLevel: '' },
    selfAssessment: { liked: '', easy: '', needs: [] },
    peerAssessment: { liked: '', easy: '', needs: [] },
    parentObservation: { resources: [], otherResource: '', remarks: '' }
  }) as StudentData['page4'];

  const Smiley = ({ type, active }: { type: 'yes' | 'no' | 'dnk', active: boolean }) => {
    const icons = {
      yes: "😊",
      no: "😐",
      dnk: "🤔"
    };
    return (
      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all ${active ? 'bg-white shadow-sm scale-125' : 'opacity-40 grayscale'}`}>
        {icons[type]}
        {active && (
            <div className="absolute -inset-1 border-2 border-dashed border-orange-500 rounded-full"></div>
        )}
      </div>
    );
  };

  const ResourceIcon = ({ name, active }: { name: string, active: boolean }) => {
    return (
      <div className={`relative p-1 rounded-md transition-all ${active ? 'bg-blue-50 border-blue-200 border scale-110' : 'opacity-30 grayscale'}`}>
        <div className="w-10 h-10 flex items-center justify-center text-2xl">
          {name === 'Classmate' && '🤝'}
          {name === 'teacher' && '👨‍🏫'}
          {name === 'books' && '📚'}
          {name === 'computer' && '💻'}
          {name === 'none' && '🚫'}
          {name === 'books/magazines' && '📖'}
          {name === 'newspapers' && '📰'}
          {name === 'toys/games/sports' && '🎲'}
          {name === 'phone/computer' && '📱'}
          {name === 'internet' && '🌐'}
          {name === 'public broadcast system' && '📻'}
          {name === 'resources for CWSN' && '♿'}
        </div>
        {active && (
          <div className="absolute top-0 right-0 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-black border border-white">
            ✓
          </div>
        )}
      </div>
    );
  };

  const CircleGraphic = ({ level }: { level: string }) => (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto border-2 border-orange-200 rounded-full p-2 bg-[#FDF5E6]">
        <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
             {/* Simple simulation of the Proficiency diagram */}
             <div className="w-full h-full rounded-full bg-gradient-to-t from-orange-100 via-blue-100 to-sky-200 border-2 border-white shadow-inner flex flex-col justify-end pb-8">
                <div className="text-center">
                    <div className={`text-[10px] font-black tracking-widest ${level === 'Sky' ? 'text-blue-600 underline' : 'text-gray-400'}`}>SKY</div>
                    <div className="h-10"></div>
                    <div className={`text-[10px] font-black tracking-widest ${level === 'Mountain' ? 'text-[#833C0C] underline' : 'text-gray-400'}`}>MOUNTAIN</div>
                    <div className="h-10"></div>
                    <div className={`text-[10px] font-black tracking-widest ${level === 'Stream' ? 'text-blue-500 underline' : 'text-gray-400'}`}>STREAM</div>
                </div>
             </div>
        </div>
        {/* Overlay Labels */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between items-center pointer-events-none">
            <span className="bg-white/80 px-2 rounded-full text-[8px] font-bold text-gray-500">LEVELS OF PROFICIENCY</span>
        </div>
    </div>
  );

  return (
    <div id="print-area-page-4" className="w-[210mm] h-[297mm] bg-white px-8 py-8 mx-auto shadow-2xl relative text-black leading-tight overflow-hidden font-serif box-border flex flex-col print:shadow-none print:m-0 border border-gray-100">
      
      {/* Teacher's Feedback Section */}
      <div className="border-2 border-[#E36C0A] rounded-xl overflow-hidden mb-6">
        <div className="bg-[#E36C0A] text-white py-1 px-4 text-center">
          <h4 className="font-black text-base tracking-widest uppercase">TEACHER'S FEEDBACK</h4>
        </div>
        <div className="grid grid-cols-2">
            <div className="border-r border-[#E36C0A] p-4 flex flex-col items-center">
                <p className="text-[10px] font-black uppercase text-gray-800 mb-2">NOTE: For each ability, mark the appropriate level</p>
                <CircleGraphic level={p4.teacherFeedback.proficiencyLevel} />
            </div>
            <div className="p-4 bg-white flex flex-col">
                <h4 className="font-bold text-[#833C0C] text-sm mb-2 text-center border-b border-orange-100 pb-1">Observational Notes</h4>
                <div className="flex-1 text-[13px] leading-relaxed italic font-sans whitespace-pre-wrap text-gray-700">
                    {p4.teacherFeedback.observationalNotes || 'No notes provided...'}
                </div>
            </div>
        </div>
      </div>

      {/* Assessment Tables Grid */}
      <div className="space-y-4 mb-6">
        {/* Self Assessment */}
        <div className="border-2 border-[#00B0F0] rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 items-center">
                <div className="col-span-2 bg-[#7030A0] h-full flex items-center justify-center p-2">
                    <h5 className="text-white font-black text-center text-sm leading-tight uppercase">Self<br/>Assessment</h5>
                </div>
                <div className="col-span-3 bg-[#92D050] h-full p-2 border-r border-[#00B0F0]">
                    <p className="text-[10px] font-black text-white text-center leading-tight mb-2 uppercase italic">I liked doing this work.</p>
                    <div className="flex justify-around">
                        <Smiley type="yes" active={p4.selfAssessment.liked === 'yes'} />
                        <Smiley type="no" active={p4.selfAssessment.liked === 'no'} />
                        <Smiley type="dnk" active={p4.selfAssessment.liked === 'dnk'} />
                    </div>
                </div>
                <div className="col-span-3 bg-[#FF66FF] h-full p-2 border-r border-[#00B0F0]">
                    <p className="text-[10px] font-black text-white text-center leading-tight mb-2 uppercase italic">I found this work easy.</p>
                    <div className="flex justify-around">
                        <Smiley type="yes" active={p4.selfAssessment.easy === 'yes'} />
                        <Smiley type="no" active={p4.selfAssessment.easy === 'no'} />
                        <Smiley type="dnk" active={p4.selfAssessment.easy === 'dnk'} />
                    </div>
                </div>
                <div className="col-span-4 bg-[#4BACC6] h-full p-2">
                    <p className="text-[10px] font-black text-white text-center leading-tight mb-2 uppercase italic">To do this work, I needed...</p>
                    <div className="flex justify-between px-1">
                        {/* Wrap ResourceIcon in React.Fragment to move key prop and avoid TS error in strict JSX checking */}
                        {['Classmate', 'teacher', 'books', 'computer', 'none'].map(res => (
                            <React.Fragment key={res}>
                                <ResourceIcon name={res} active={p4.selfAssessment.needs.includes(res)} />
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Peer Assessment */}
        <div className="border-2 border-[#00B0F0] rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 items-center">
                <div className="col-span-2 bg-[#2F5496] h-full flex items-center justify-center p-2">
                    <h5 className="text-white font-black text-center text-sm leading-tight uppercase">Peer<br/>Assessment</h5>
                </div>
                <div className="col-span-3 bg-[#00B050] h-full p-2 border-r border-[#00B0F0]">
                    <p className="text-[10px] font-black text-white text-center leading-tight mb-2 uppercase italic">My friend liked doing this work.</p>
                    <div className="flex justify-around">
                        <Smiley type="yes" active={p4.peerAssessment.liked === 'yes'} />
                        <Smiley type="no" active={p4.peerAssessment.liked === 'no'} />
                        <Smiley type="dnk" active={p4.peerAssessment.liked === 'dnk'} />
                    </div>
                </div>
                <div className="col-span-3 bg-[#E91E63] h-full p-2 border-r border-[#00B0F0]">
                    <p className="text-[10px] font-black text-white text-center leading-tight mb-2 uppercase italic">My friend found this work easy.</p>
                    <div className="flex justify-around">
                        <Smiley type="yes" active={p4.peerAssessment.easy === 'yes'} />
                        <Smiley type="no" active={p4.peerAssessment.easy === 'no'} />
                        <Smiley type="dnk" active={p4.peerAssessment.easy === 'dnk'} />
                    </div>
                </div>
                <div className="col-span-4 bg-[#00B0F0] h-full p-2">
                    <p className="text-[10px] font-black text-white text-center leading-tight mb-2 uppercase italic">To do this work, My friend needed...</p>
                    <div className="flex justify-between px-1">
                        {/* Wrap ResourceIcon in React.Fragment to move key prop and avoid TS error in strict JSX checking */}
                        {['Classmate', 'teacher', 'books', 'computer', 'none'].map(res => (
                            <React.Fragment key={res}>
                                <ResourceIcon name={res} active={p4.peerAssessment.needs.includes(res)} />
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Parents Observation Section */}
      <div className="border-2 border-[#E36C0A] rounded-xl overflow-hidden flex flex-col mb-6">
        <div className="bg-[#E36C0A] text-white py-1 px-4 text-center">
          <h4 className="font-black text-base tracking-widest uppercase leading-tight">Parents/Caregiver/Guardian's Observation</h4>
        </div>
        <div className="p-4 bg-white">
            <div className="flex items-start gap-4">
                <div className="bg-[#2F5496] p-3 rounded-lg flex flex-col items-center justify-center w-36 flex-shrink-0">
                    <span className="text-white font-black text-[12px] uppercase text-center leading-tight">Learning Teaching resources at home</span>
                </div>
                <div className="flex-1 grid grid-cols-4 gap-2 border-2 border-dashed border-[#2F5496] p-3 rounded-lg bg-gray-50">
                    {['books/magazines', 'newspapers', 'toys/games/sports', 'phone/computer', 'internet', 'public broadcast system', 'resources for CWSN'].map(res => (
                        <div key={res} className="flex flex-col items-center gap-1">
                            <ResourceIcon name={res} active={p4.parentObservation.resources.includes(res)} />
                            <span className="text-[7px] font-black text-gray-500 uppercase text-center h-4 flex items-center leading-none">{res}</span>
                        </div>
                    ))}
                    <div className="flex flex-col gap-1 border-l pl-2 border-gray-200">
                         <span className="text-[8px] font-black text-blue-600 uppercase mb-1">Other (specify)</span>
                         <div className="border-b border-blue-400 h-10 w-full text-[10px] italic font-sans flex items-center px-1 break-words">
                            {p4.parentObservation.otherResource}
                         </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Remarks Box */}
        <div className="border-t-2 border-[#E36C0A] flex flex-col">
            <div className="bg-[#FCE4D6] py-1 text-center border-b border-[#E36C0A]">
                <h4 className="font-black text-[#833C0C] text-sm uppercase tracking-wide">Comments/Remarks</h4>
            </div>
            <div className="p-4 bg-white min-h-[140px] text-[13px] italic font-sans whitespace-pre-wrap text-gray-700">
                {p4.parentObservation.remarks || 'Enter parent observations here...'}
            </div>
        </div>
      </div>

      {/* Footer Page Number */}
      <div className="mt-auto text-center font-black text-black text-xs pb-1">
        4
      </div>

    </div>
  );
};

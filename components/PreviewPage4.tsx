
import React from 'react';
import { StudentData } from '../types';

interface PreviewProps {
  data: StudentData;
}

export const PreviewPage4: React.FC<PreviewProps> = ({ data }) => {
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
      <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-xl transition-all border-2 ${
        active 
          ? 'bg-white border-orange-500 shadow-md scale-110 z-10' 
          : 'bg-white/40 border-transparent opacity-60 grayscale-[0.5]'
      }`}>
        {icons[type]}
        {active && (
            <div className="absolute -inset-1 border border-orange-300 rounded-full animate-pulse"></div>
        )}
      </div>
    );
  };

  // Fixed: Added optional key property to type definition to satisfy TS when used in .map()
  const ResourceIcon = ({ name, active, parentType }: { name: string, active: boolean, parentType: 'self' | 'peer' | 'parent', key?: React.Key }) => {
    const activeColors = {
      self: 'border-purple-500 text-purple-700',
      peer: 'border-blue-600 text-blue-800',
      parent: 'border-orange-600 text-orange-800'
    };

    return (
      <div className={`relative p-1 rounded-lg transition-all border-2 flex flex-col items-center justify-center ${
        active 
          ? `bg-white ${activeColors[parentType]} shadow-sm scale-110 z-10` 
          : 'bg-white/30 border-transparent opacity-50 grayscale'
      }`}>
        <div className="w-9 h-9 flex items-center justify-center text-xl">
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
          <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm">
            ✓
          </div>
        )}
      </div>
    );
  };

  const CircleGraphic = ({ level }: { level: string }) => (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto border-2 border-orange-200 rounded-full p-2 bg-[#FDF5E6] shadow-md">
        <div className="absolute inset-0 flex flex-col items-center justify-center z-0 p-4">
             <div className="w-full h-full rounded-full bg-white border-2 border-white shadow-inner flex flex-col justify-end relative overflow-hidden">
                
                {/* BACKGROUND GRAPHICS LAYER */}
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-sky-100/50 flex items-center justify-center overflow-hidden">
                   <div className="absolute top-4 left-6 w-12 h-6 bg-white rounded-full opacity-60 filter blur-[1px]"></div>
                   <div className="absolute top-8 right-8 w-16 h-8 bg-white rounded-full opacity-60 filter blur-[1px]"></div>
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-100 rounded-full blur-xl opacity-40"></div>
                </div>

                <div className="absolute top-1/3 left-0 right-0 h-1/3 bg-orange-50/30 overflow-hidden">
                   <div className="absolute bottom-0 left-[-10%] w-[60%] h-full bg-[#833C0C]/10 skew-x-[-20deg] origin-bottom" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                   <div className="absolute bottom-0 right-[-10%] w-[70%] h-[120%] bg-[#833C0C]/15 skew-x-[15deg] origin-bottom" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-blue-50">
                    <div className="absolute inset-0 opacity-20">
                       <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <path d="M0 20 Q 25 10, 50 20 T 100 20 V 40 H 0 Z" fill="#3B82F6" />
                          <path d="M0 25 Q 25 15, 50 25 T 100 25 V 40 H 0 Z" fill="#60A5FA" opacity="0.5" />
                       </svg>
                    </div>
                </div>

                {/* CONTENT LAYER */}
                <div className="text-center relative z-10 w-full flex flex-col items-center pb-4">
                    <div className="h-1/3 w-full flex flex-col justify-center items-center py-2">
                        <div className={`text-[11px] font-black tracking-[0.2em] transition-all mb-1 ${level === 'Sky' ? 'text-blue-700 scale-125' : 'text-gray-400'}`}>SKY</div>
                        <div className="h-10 flex items-center justify-center">
                            {level === 'Sky' && <div className="text-yellow-400 text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] animate-pulse">★</div>}
                        </div>
                    </div>

                    <div className="h-1/3 w-full flex flex-col justify-center items-center py-2 border-y border-orange-100/50">
                        <div className={`text-[11px] font-black tracking-[0.2em] transition-all mb-1 ${level === 'Mountain' ? 'text-[#833C0C] scale-125' : 'text-gray-400'}`}>MOUNTAIN</div>
                        <div className="h-10 flex items-center justify-center">
                            {level === 'Mountain' && <div className="text-orange-500 text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">★</div>}
                        </div>
                    </div>

                    <div className="h-1/3 w-full flex flex-col justify-center items-center py-2">
                        <div className={`text-[11px] font-black tracking-[0.2em] transition-all mb-1 ${level === 'Stream' ? 'text-blue-600 scale-125' : 'text-gray-400'}`}>STREAM</div>
                        <div className="h-10 flex items-center justify-center">
                            {level === 'Stream' && <div className="text-blue-400 text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">★</div>}
                        </div>
                    </div>
                </div>
             </div>
        </div>
        <div className="absolute inset-0 p-6 flex flex-col justify-between items-center pointer-events-none">
            <span className="bg-white/95 px-4 py-1 rounded-full text-[10px] font-black text-orange-600 border border-orange-200 shadow-sm uppercase tracking-tighter">LEVELS OF PROFICIENCY</span>
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
        <div className="border-2 border-[#00B0F0] rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 items-stretch min-h-[90px]">
                <div className="col-span-2 bg-[#7030A0] flex items-center justify-center p-2">
                    <h5 className="text-white font-black text-center text-xs leading-tight uppercase">Self<br/>Assessment</h5>
                </div>
                {/* Softened background for better unselected visibility */}
                <div className="col-span-3 bg-[#92D050]/80 p-2 border-r border-[#00B0F0] flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-white text-center leading-tight mb-2 uppercase italic drop-shadow-sm">I liked doing this work.</p>
                    <div className="flex justify-around w-full px-2">
                        <Smiley type="yes" active={p4.selfAssessment.liked === 'yes'} />
                        <Smiley type="no" active={p4.selfAssessment.liked === 'no'} />
                        <Smiley type="dnk" active={p4.selfAssessment.liked === 'dnk'} />
                    </div>
                </div>
                <div className="col-span-3 bg-[#FF66FF]/80 p-2 border-r border-[#00B0F0] flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-white text-center leading-tight mb-2 uppercase italic drop-shadow-sm">I found this work easy.</p>
                    <div className="flex justify-around w-full px-2">
                        <Smiley type="yes" active={p4.selfAssessment.easy === 'yes'} />
                        <Smiley type="no" active={p4.selfAssessment.easy === 'no'} />
                        <Smiley type="dnk" active={p4.selfAssessment.easy === 'dnk'} />
                    </div>
                </div>
                <div className="col-span-4 bg-[#4BACC6]/80 p-2 flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-white text-center leading-tight mb-2 uppercase italic drop-shadow-sm">To do this work, I needed...</p>
                    <div className="flex justify-between w-full px-1">
                        {['Classmate', 'teacher', 'books', 'computer', 'none'].map(res => (
                            <ResourceIcon key={res} name={res} active={p4.selfAssessment.needs.includes(res)} parentType="self" />
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Peer Assessment */}
        <div className="border-2 border-[#00B0F0] rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 items-stretch min-h-[90px]">
                <div className="col-span-2 bg-[#2F5496] flex items-center justify-center p-2">
                    <h5 className="text-white font-black text-center text-xs leading-tight uppercase">Peer<br/>Assessment</h5>
                </div>
                <div className="col-span-3 bg-[#00B050]/80 p-2 border-r border-[#00B0F0] flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-white text-center leading-tight mb-2 uppercase italic drop-shadow-sm">My friend liked doing this work.</p>
                    <div className="flex justify-around w-full px-2">
                        <Smiley type="yes" active={p4.peerAssessment.liked === 'yes'} />
                        <Smiley type="no" active={p4.peerAssessment.liked === 'no'} />
                        <Smiley type="dnk" active={p4.peerAssessment.liked === 'dnk'} />
                    </div>
                </div>
                <div className="col-span-3 bg-[#E91E63]/80 p-2 border-r border-[#00B0F0] flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-white text-center leading-tight mb-2 uppercase italic drop-shadow-sm">My friend found this work easy.</p>
                    <div className="flex justify-around w-full px-2">
                        <Smiley type="yes" active={p4.peerAssessment.easy === 'yes'} />
                        <Smiley type="no" active={p4.peerAssessment.easy === 'no'} />
                        <Smiley type="dnk" active={p4.peerAssessment.easy === 'dnk'} />
                    </div>
                </div>
                <div className="col-span-4 bg-[#00B0F0]/80 p-2 flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-white text-center leading-tight mb-2 uppercase italic drop-shadow-sm">To do this work, My friend needed...</p>
                    <div className="flex justify-between w-full px-1">
                        {['Classmate', 'teacher', 'books', 'computer', 'none'].map(res => (
                            <ResourceIcon key={res} name={res} active={p4.peerAssessment.needs.includes(res)} parentType="peer" />
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
                <div className="bg-[#2F5496] p-3 rounded-lg flex flex-col items-center justify-center w-36 flex-shrink-0 shadow-sm">
                    <span className="text-white font-black text-[11px] uppercase text-center leading-tight">Learning Teaching resources at home</span>
                </div>
                <div className="flex-1 grid grid-cols-4 gap-3 border-2 border-dashed border-[#2F5496]/40 p-3 rounded-lg bg-gray-50/50">
                    {['books/magazines', 'newspapers', 'toys/games/sports', 'phone/computer', 'internet', 'public broadcast system', 'resources for CWSN'].map(res => (
                        <div key={res} className="flex flex-col items-center gap-1">
                            <ResourceIcon name={res} active={p4.parentObservation.resources.includes(res)} parentType="parent" />
                            <span className="text-[7px] font-black text-gray-600 uppercase text-center h-4 flex items-center leading-none">{res}</span>
                        </div>
                    ))}
                    <div className="flex flex-col gap-1 border-l-2 pl-2 border-gray-200">
                         <span className="text-[8px] font-black text-blue-600 uppercase mb-1">Other (specify)</span>
                         <div className="border-b border-blue-400 min-h-10 w-full text-[10px] italic font-sans flex items-center px-1 break-words leading-tight">
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
            <div className="p-4 bg-white min-h-[140px] text-[13px] italic font-sans whitespace-pre-wrap text-gray-700 leading-relaxed">
                {p4.parentObservation.remarks || 'Enter parent observations here...'}
            </div>
        </div>
      </div>

      <div className="mt-auto text-center font-black text-black text-xs pb-1">
        4
      </div>

    </div>
  );
};

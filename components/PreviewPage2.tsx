
import React from 'react';
import { StudentData } from '../types';

interface PreviewProps {
  data: StudentData;
}

export const PreviewPage2: React.FC<PreviewProps> = ({ data }) => {
  const FavItem = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => (
    <div className="flex items-center gap-2 w-full mb-3">
        <div className="flex items-center gap-1 w-28 flex-shrink-0">
             <div className="text-2xl">{icon}</div>
             <span className="font-bold text-[#7030A0] text-[14px] uppercase">{label}</span>
        </div>
        <div className="flex-1 h-9 bg-[#FCE4D6] rounded-r-full flex items-center px-4 font-bold text-gray-800 text-sm border-l-[5px] border-orange-500 shadow-sm overflow-hidden whitespace-nowrap">
            {value}
        </div>
    </div>
  );

  return (
    <div id="print-area-page-2" className="w-[210mm] h-[297mm] bg-white px-10 py-6 mx-auto shadow-2xl relative text-black leading-tight overflow-hidden font-sans box-border flex flex-col print:shadow-none print:m-0 print:bg-white border border-gray-100">
        
        {/* Header Part A(2) */}
        <div className="text-center mb-4">
            <h2 className="text-[#E36C0A] font-bold text-lg tracking-wide">PART-A (2)</h2>
        </div>

        {/* Main Title Brown Pill */}
        <div className="flex justify-center mb-6">
            <div className="bg-[#833C0C] text-white px-10 py-2 rounded-full shadow-md border-2 border-white">
                <h1 className="text-2xl font-black tracking-widest uppercase flex items-center gap-2">
                    <span className="text-white text-base">★</span> ME AND MY SURROUNDINGS <span className="text-white text-base">★</span>
                </h1>
            </div>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-12 gap-4 mb-8 items-start relative px-2">
            {/* THIS IS ME Frame */}
            <div className="col-span-5 relative mt-12">
                 <div className="absolute -top-16 -left-6 flex items-baseline gap-3 z-10 pointer-events-none">
                    <span className="text-3xl font-black text-black tracking-tight transform rotate-[-12deg]">THIS IS</span>
                    <span className="text-6xl font-black text-black transform rotate-[4deg] drop-shadow-sm">ME</span>
                 </div>
                 
                 <div className="w-full aspect-[1.1] border-[4px] border-black rounded-[30px] bg-white overflow-hidden p-2 transform rotate-[-1deg] shadow-sm">
                    <div className="w-full h-full bg-white flex items-center justify-center">
                        {data.mePhotoUrl ? (
                            <img src={data.mePhotoUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-200 text-xs font-bold text-center italic">Insert Photo /<br/>Draw Here</div>
                        )}
                    </div>
                 </div>
                 
                 <span className="absolute -top-6 -right-2 text-red-500 text-2xl">★</span>
                 <span className="absolute top-2 right-6 text-green-500 text-xl">★</span>
            </div>

            {/* Age Center */}
            <div className="col-span-3 flex flex-col items-center justify-center pt-6">
                <span className="text-xl font-black text-[#833C0C] uppercase tracking-wide">I AM</span>
                <div className="w-28 h-20 rounded-[45%] border-[6px] border-white bg-[#FCE4D6] shadow-inner flex items-center justify-center text-5xl font-black text-[#833C0C] transform scale-110">
                    {data.age || ''}
                </div>
                <span className="text-xl font-black text-[#833C0C] uppercase mt-2 leading-none text-center tracking-wide">YEARS<br/>OLD</span>
                <span className="text-orange-400 text-4xl mt-2 transform scale-125">★</span>
            </div>

            {/* Birthday Balloon */}
            <div className="col-span-4 flex flex-col items-center relative pt-2">
                <div className="w-40 h-44 bg-[#7030A0] rounded-[50%_50%_50%_50%/55%_55%_45%_45%] flex flex-col items-center justify-center text-white p-4 relative shadow-xl transform rotate-[-3deg]">
                    <div className="absolute top-4 left-6 w-8 h-4 bg-white/30 rounded-full transform rotate-[-35deg]"></div>
                    <span className="text-base font-bold leading-none mb-0.5">My</span>
                    <span className="text-xl font-black leading-none uppercase tracking-tight">Birthday</span>
                    <span className="text-base font-bold leading-none mt-0.5">is on</span>
                    <div className="mt-3 w-[110%] h-9 bg-white rounded-full flex items-center justify-center text-[#7030A0] font-black px-3 text-sm shadow-inner z-10 border-2 border-purple-200">
                        {data.dob}
                    </div>
                    <div className="absolute -bottom-1 w-6 h-4 bg-[#7030A0] transform rotate-0" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }}></div>
                    <div className="absolute -bottom-16 w-1 h-16 bg-gradient-to-b from-gray-400 to-transparent opacity-40"></div>
                </div>
                <span className="absolute -top-2 -right-2 text-yellow-400 text-xl animate-pulse">★</span>
            </div>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-12 gap-6 flex-grow-0 mt-2">
            
            {/* Left Column: This is my family */}
            <div className="col-span-7 flex flex-col">
                <div className="relative pt-4">
                    <div className="w-full h-[380px] border-[10px] border-[#00B050] rounded-[50px] p-2 bg-white relative shadow-sm">
                        <div className="w-full h-full border-[5px] border-[#FFC000] rounded-[35px] overflow-hidden flex items-center justify-center bg-white">
                            {data.familyPhotoUrl ? (
                                <img src={data.familyPhotoUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-gray-100 text-3xl font-bold text-center italic">Insert Photo /<br/>Draw Family Here</div>
                            )}
                        </div>
                    </div>
                    <div className="absolute -bottom-2 left-8 font-black text-[#E21E26] text-3xl tracking-tight z-10 bg-white px-2">
                        This is my family
                    </div>
                    <div className="absolute top-0 -left-6 w-14 h-14 bg-yellow-400 rounded-full border-[3px] border-black flex items-center justify-center text-2xl shadow-sm transform rotate-[-10deg]">😊</div>
                    <div className="absolute top-20 -left-4 w-12 h-12 bg-[#E91E63] rounded-full border-[3px] border-black flex items-center justify-center text-xl shadow-sm transform rotate-[15deg]">😊</div>
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-[#7030A0] text-5xl">★</span>
                </div>
            </div>

            {/* Right Column */}
            <div className="col-span-5 flex flex-col gap-4 -mt-28">
                
                {/* I Live In */}
                <div className="relative">
                    <h3 className="text-[#00B0F0] text-xl font-black mb-1 italic ml-6">I live in</h3>
                    <div className="w-full min-h-28 border-2 border-gray-300 rounded-[30px] bg-white p-4 relative flex flex-col justify-center shadow-sm">
                         {/* Address wrapping container with visual dotted line simulation */}
                         <div className="relative z-0">
                            <div className="absolute inset-0 flex flex-col pointer-events-none">
                                <div className="h-6 border-b-2 border-[#00B0F0] border-dotted w-full"></div>
                                <div className="h-6 border-b-2 border-[#00B0F0] border-dotted w-full"></div>
                                <div className="h-6 border-b-2 border-[#00B0F0] border-dotted w-full"></div>
                            </div>
                            <div className="relative font-bold text-gray-800 text-center text-sm leading-6 min-h-[4.5rem] break-words">
                                {data.address}
                            </div>
                         </div>
                         <div className="absolute bottom-1 right-2 w-10 h-10 text-[#00B0F0] bg-white p-1">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                         </div>
                    </div>
                </div>

                {/* Friends Box */}
                <div className="relative w-full mt-12">
                     <div className="w-full h-56 border-[6px] border-[#00B0F0] bg-white p-5 relative flex flex-col mb-4 shadow-sm">
                        <div className="flex-1 space-y-2.5">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#7030A0] flex-shrink-0"></div>
                                    <div className="flex-1 border-b-[2px] border-gray-400 border-dotted h-5 font-black text-base text-gray-800 px-1 leading-none overflow-hidden whitespace-nowrap">
                                        {data.friends.split(',')[i]?.trim() || ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-[110%]">
                             <div className="bg-[#E36C0A] text-white py-1 px-3 rounded-[35px] font-black text-lg italic text-center shadow-lg border-[3px] border-white uppercase tracking-tight">
                                are my friends
                             </div>
                        </div>

                        <div className="absolute -top-16 -left-12 w-28 h-28 transform rotate-6 drop-shadow-md select-none pointer-events-none z-10">
                            <svg viewBox="0 0 24 24" className="w-full h-full">
                                <path 
                                    fill="#E21E26" 
                                    stroke="white" 
                                    strokeWidth="1.2"
                                    d="M12 1.74l3.09 6.26 6.91 1-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1L12 1.74z"
                                />
                            </svg>
                        </div>
                     </div>
                </div>

                {/* Ambition Box */}
                <div className="mt-1 bg-[#7030A0] p-1 rounded-[35px] shadow-lg">
                    <div className="bg-white rounded-[32px] p-3 flex flex-col items-center border-[2px] border-white">
                        <span className="text-[10px] font-black text-black uppercase tracking-wider mb-1">I WANT TO BE A</span>
                        <div className="w-full border-b-[2px] border-black pb-0.5 mb-1">
                            <div className="text-center font-black text-lg text-[#7030A0] min-h-[1.5rem] uppercase tracking-wider italic">
                                {data.ambition}
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-black uppercase tracking-wider">WHEN I GROW UP</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Section: My Favourite */}
        <div className="mt-2 border-[4px] border-white shadow-xl bg-white p-8 rounded-[40px] relative">
            <h2 className="text-[#2F5496] text-3xl font-black mb-6 flex items-center gap-3 italic">
                My Favourite : <span className="text-yellow-400 text-4xl not-italic ml-1 drop-shadow-sm">★</span>
            </h2>

            <div className="grid grid-cols-2 gap-x-16">
                <div className="space-y-3">
                    <FavItem label="Colour" value={data.favColour} icon="🎨"/>
                    <FavItem label="Food" value={data.favFood} icon="🍲"/>
                    <FavItem label="Animal" value={data.favAnimal} icon="🐾"/>
                </div>
                <div className="space-y-3">
                    <FavItem label="Flower" value={data.favFlower} icon="🌸"/>
                    <FavItem label="Sport" value={data.favSport} icon="🏅"/>
                    <FavItem label="Subject" value={data.favSubject} icon="📖"/>
                </div>
            </div>
            
            <span className="absolute -bottom-6 -right-6 text-yellow-400 text-6xl opacity-80 transform rotate-12 drop-shadow-sm">★</span>
            <span className="absolute top-4 right-14 text-orange-400 text-3xl">★</span>
            <span className="absolute -top-8 -left-8 text-green-500 text-5xl">★</span>
        </div>

        <div className="mt-auto text-center font-black text-black text-xs pb-1">
            2
        </div>

    </div>
  );
};

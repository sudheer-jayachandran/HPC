
import React from 'react';
import { StudentData } from '../types';

interface PreviewProps {
  data: StudentData;
}

export const PreviewPage3: React.FC<PreviewProps> = ({ data }) => {
  const d1 = data.partB?.domain1 || {
    curricularGoals: '',
    competencies: '',
    activity: '',
    assessmentQuestions: '',
    rubric: { awareness: '', sensitivity: '', creativity: '' }
  };

  const RubricCell = ({ checked }: { checked: boolean }) => (
    <div className="flex items-center justify-center w-full h-full">
      {checked && (
        <div className="w-10 h-6 border-[2px] border-[#E36C0A] rounded-full flex items-center justify-center font-bold text-[#E36C0A] animate-in zoom-in-50 duration-200">
           ✓
        </div>
      )}
    </div>
  );

  return (
    <div id="print-area-page-3" className="w-[210mm] h-[297mm] bg-white px-10 py-10 mx-auto shadow-2xl relative text-black leading-tight overflow-hidden font-serif box-border flex flex-col print:shadow-none print:m-0 border border-gray-100">
      
      {/* Header Part B */}
      <div className="text-center mb-6">
        <h2 className="text-[#E36C0A] font-bold text-xl tracking-widest uppercase">PART B</h2>
      </div>

      {/* Domain Header Box */}
      <div className="bg-[#E36C0A] text-white py-2 px-4 rounded-t-lg text-center mb-0">
        <h3 className="text-lg font-bold uppercase tracking-wide">DOMAIN 1: Physical Development</h3>
      </div>

      {/* Goals and Competencies Table */}
      <div className="grid grid-cols-2 border-x border-[#E36C0A] border-b border-[#E36C0A]">
        <div className="border-r border-[#E36C0A] p-3 flex flex-col bg-[#FFF8F2]">
          <h4 className="font-bold text-black text-sm mb-2">Curricular Goals:</h4>
          <p className="text-[10px] italic text-gray-500 mb-2">(Can choose one or more)</p>
          <div className="text-[12px] leading-relaxed whitespace-pre-wrap font-sans min-h-[100px]">
            {d1.curricularGoals}
          </div>
        </div>
        <div className="p-3 flex flex-col bg-white">
          <h4 className="font-bold text-black text-sm mb-2">Competency/Competencies</h4>
          <p className="text-[10px] italic text-gray-500 mb-2">(Can choose one or more)</p>
          <div className="text-[12px] leading-relaxed whitespace-pre-wrap font-sans min-h-[100px]">
            {d1.competencies}
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="mt-4 border border-[#E36C0A] rounded-lg overflow-hidden flex flex-col">
        <div className="bg-[#E36C0A] text-white py-1 px-4 text-center">
          <h4 className="font-bold text-sm tracking-widest uppercase">ACTIVITY</h4>
        </div>
        <div className="p-4 bg-white min-h-[180px] text-sm font-sans whitespace-pre-wrap">
          {d1.activity}
        </div>
      </div>

      {/* Assessment Questions Section */}
      <div className="mt-4 border border-[#E36C0A] rounded-lg overflow-hidden flex flex-col">
        <div className="bg-[#E36C0A] text-white py-1 px-4 text-center">
          <h4 className="font-bold text-sm tracking-widest uppercase">ASSESSMENT QUESTIONS</h4>
        </div>
        <div className="p-4 bg-white min-h-[180px] text-sm font-sans whitespace-pre-wrap">
          {d1.assessmentQuestions}
        </div>
      </div>

      {/* Rubric Table */}
      <div className="mt-6 border border-[#E36C0A] rounded-lg overflow-hidden">
        <div className="bg-[#E36C0A] text-white py-1 px-4 text-center">
          <h4 className="font-bold text-sm tracking-widest uppercase">ASSESSMENT RUBRIC*</h4>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#E36C0A] text-white text-xs">
              <th className="border-r border-white/30 py-2 px-2 w-1/4"></th>
              <th className="border-r border-white/30 py-2 px-2 w-1/4 font-bold uppercase tracking-wider">Stream</th>
              <th className="border-r border-white/30 py-2 px-2 w-1/4 font-bold uppercase tracking-wider">Mountain</th>
              <th className="py-2 px-2 w-1/4 font-bold uppercase tracking-wider">Sky</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold font-serif">
            <tr className="border-b border-orange-200">
              <td className="p-4 bg-[#FCE4D6] text-black border-r border-orange-200">Awareness</td>
              <td className="p-0 border-r border-orange-200 h-12"><RubricCell checked={d1.rubric.awareness === 'Stream'} /></td>
              <td className="p-0 border-r border-orange-200 h-12"><RubricCell checked={d1.rubric.awareness === 'Mountain'} /></td>
              <td className="p-0 h-12"><RubricCell checked={d1.rubric.awareness === 'Sky'} /></td>
            </tr>
            <tr className="border-b border-orange-200">
              <td className="p-4 bg-[#FCE4D6] text-black border-r border-orange-200">Sensitivity</td>
              <td className="p-0 border-r border-orange-200 h-12"><RubricCell checked={d1.rubric.sensitivity === 'Stream'} /></td>
              <td className="p-0 border-r border-orange-200 h-12"><RubricCell checked={d1.rubric.sensitivity === 'Mountain'} /></td>
              <td className="p-0 h-12"><RubricCell checked={d1.rubric.sensitivity === 'Sky'} /></td>
            </tr>
            <tr>
              <td className="p-4 bg-[#FCE4D6] text-black border-r border-orange-200">Creativity</td>
              <td className="p-0 border-r border-orange-200 h-12"><RubricCell checked={d1.rubric.creativity === 'Stream'} /></td>
              <td className="p-0 border-r border-orange-200 h-12"><RubricCell checked={d1.rubric.creativity === 'Mountain'} /></td>
              <td className="p-0 h-12"><RubricCell checked={d1.rubric.creativity === 'Sky'} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note */}
      <p className="text-[10px] mt-2 italic font-bold text-gray-800">
        * Note: Circle the relevant performance level based on the individual student's performance for each ability for this activity.
      </p>

      {/* Page Footer */}
      <div className="mt-auto text-center font-bold text-black text-xs pb-1">
        3
      </div>

    </div>
  );
};

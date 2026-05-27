import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContextInstance';
import { Languages, HelpCircle, Code, CornerDownLeft, Sparkles } from 'lucide-react';

const TranslateCode = () => {
  const { getSelectedtext, buttonPromtCode, loading } = useContext(AppContext);
  const [targetLanguage, setTargetLanguage] = useState('Python');
  const [customInstructions, setCustomInstructions] = useState('');

  const languages = [
    { name: 'JavaScript', ext: 'js' },
    { name: 'TypeScript', ext: 'ts' },
    { name: 'Python', ext: 'py' },
    { name: 'Java', ext: 'java' },
    { name: 'C++', ext: 'cpp' },
    { name: 'C#', ext: 'cs' },
    { name: 'Rust', ext: 'rs' },
    { name: 'Go', ext: 'go' },
    { name: 'HTML/CSS', ext: 'html' },
  ];

  const handleTranslate = async () => {
    const selectedCode = await getSelectedtext();

    if (!selectedCode || !selectedCode.trim()) {
      alert("Please highlight/select some code in the editor first!");
      return;
    }

    const basePrompt = `Translate the selected code to ${targetLanguage}. Keep the logic identical but adapt it fully to ${targetLanguage} best practices.`;
    const fullPrompt = customInstructions.trim() 
      ? `${basePrompt}\n\nAdditional instructions: ${customInstructions}`
      : basePrompt;

    await buttonPromtCode(selectedCode, fullPrompt);
  };

  return (
    <div className="flex flex-col h-full bg-[#121215] text-[#E4E4E7] p-5 gap-6">
      
      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> AI Engine
        </span>
        <h3 className="text-sm font-semibold text-white">Translate Selected Code</h3>
        <p className="text-xs text-[#8E8E93] leading-relaxed">
          Instantly convert your active code snippet into another programming language using context-aware AI translation.
        </p>
      </div>

      {/* Action Card */}
      <div className="bg-[#18181C] border border-[#27272A] rounded-xl p-4 flex flex-col gap-4 shadow-sm">
        
        {/* Step 1 */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
            1. Select Target Language
          </label>
          <div className="relative">
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full bg-[#0E0E10] text-[#E4E4E7] border border-[#27272A] rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none"
            >
              {languages.map((lang) => (
                <option key={lang.name} value={lang.name}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717A]">
              <Languages className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
            2. Additional Prompting (Optional)
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g., Use functional programming patterns, write comments..."
            className="w-full h-20 bg-[#0E0E10] text-[#E4E4E7] border border-[#27272A] rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500 placeholder-[#52525B] resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-zinc-700 disabled:to-zinc-800 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-lg cursor-pointer transition active:scale-97 flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20"
        >
          {loading ? (
            <span>Translating...</span>
          ) : (
            <>
              <Code className="w-3.5 h-3.5" />
              <span>Translate Snippet</span>
            </>
          )}
        </button>
      </div>

      {/* Guide/Instructions */}
      <div className="flex gap-2.5 bg-[#141E1A] border-l-2 border-emerald-500 p-3.5 rounded-r-xl">
        <HelpCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">How to Use:</span>
          <ol className="text-[11px] text-[#A1A1AA] leading-relaxed list-decimal pl-3 flex flex-col gap-1 font-medium">
            <li>Open a code file in the editor.</li>
            <li>Highlight/select the specific snippet you wish to translate.</li>
            <li>Choose your target language above.</li>
            <li>Click <strong>Translate Snippet</strong> to generate results in the AI Panel!</li>
          </ol>
        </div>
      </div>

    </div>
  );
};

export default TranslateCode;
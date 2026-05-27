import React from 'react';
import { Folder, ArrowRight, Layers, FileCode2 } from 'lucide-react';
import { codeBase } from '../store/codeBase';

const ProjectBox = ({ content }) => {
  const project = codeBase((state) => state.project);
  const projectFiles = project[content]?.files || {};
  const fileCount = Object.keys(projectFiles).length;

  return (
    <div className="group relative bg-[#18181C]/90 hover:bg-[#1E1E24]/90 border border-[#27272A] hover:border-[#6B69DA]/50 rounded-2xl p-6 h-[200px] w-[280px] flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1">

      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-violet-500/0 to-[#6B69DA]/0 group-hover:from-indigo-500/2 group-hover:via-violet-500/2 group-hover:to-[#6B69DA]/5 rounded-2xl transition-all duration-500 pointer-events-none" />

      {/* Top Details */}
      <div className="flex items-start justify-between w-full relative">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6B69DA]/10 to-[#8E8DED]/10 border border-[#6B69DA]/20 text-[#8E8DED] group-hover:scale-105 transition-transform duration-300">
          <Folder className="w-5.5 h-5.5 text-[#8E8DED]" />
        </div>

        {/* Files Badge */}
        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-[#242429] border border-[#2E2E33] px-2.5 py-1 rounded-full group-hover:text-[#8E8DED] group-hover:border-[#6B69DA]/30 transition-all">
          <FileCode2 className="w-3 h-3" />
          {fileCount} {fileCount === 1 ? 'file' : 'files'}
        </span>
      </div>

      {/* Bottom Title & Actions */}
      <div className="flex flex-col gap-3 relative w-full">
        <div className="flex flex-col">
          <h2 className="text-base font-bold text-white tracking-wide truncate group-hover:text-[#8E8DED] transition-colors duration-200">
            {content}
          </h2>
          <span className="text-[10px] text-gray-500 font-medium">
            Project Folder
          </span>
        </div>

        <div className="w-full h-[1px] bg-[#27272A] group-hover:bg-[#3F3F46] transition-colors" />

        <div className="flex items-center justify-between text-xs font-semibold text-gray-400 group-hover:text-white transition-colors">
          <span>Open Workspace</span>
          <ArrowRight className="w-4 h-4 text-[#8E8DED] transform group-hover:translate-x-1.5 transition-transform duration-300" />
        </div>
      </div>

    </div>
  );
};

export default ProjectBox;
import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContextInstance";
import Loader from "./Loader";
import AiStructure from "./AiStructure";
import { codeBase } from "../store/codeBase";
import { useParams } from "react-router-dom";
import { Sparkles, Send, Bug, Zap, Code2, BookOpen, Bot } from "lucide-react";

const AiChat = () => {
  const {
    getSelectedtext,
    promtCode,
    buttonPromtCode,
    loading,
  } = useContext(AppContext);

  const [prompt, setPrompt] = useState("");
  const params = useParams();

  const activeProject = codeBase((state) => state.activeProject);
  const project = codeBase((state) => state.project);

  const activeMessage = project?.[activeProject]?.message || [];

  const bottomRef = useRef(null)

  const scrolToBottom = () => {
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrolToBottom();
  }, [activeMessage]);

  const utilsButton = [
    {
      name: "Refactor Code",
      prompt: "Refactor the following code:\n\n",
    },
    {
      name: "Explain Code",
      prompt: "Explain the following code:\n\n",
    },
    {
      name: "Find Bug",
      prompt: "Find the bug in the following code:\n\n",
    },
    {
      name: "Optimize Code",
      prompt: "Optimize the following code:\n\n",
    },
  ];



  const handleUtilityPrompt = async (btnPrompt) => {
    const code = await getSelectedtext();
    await buttonPromtCode(code, btnPrompt);
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;

    await promtCode(prompt);

    setPrompt("");
  };



  return (
    <div className="h-full bg-[#201F20] text-white relative">
      {/* Header */}
      <div className="bg-[#252426] p-2 h-[22vh] w-full">
        <div className=" flex items-center gap-2 px-3 mb-4">
          <div className="bg-amber-400/25 text-amber-400 p-1 rounded-lg"><Bot className="w-5 h-5" /></div>

          <h1 className="text-xl ">AI Assistant</h1>
        </div>
        {/* button of optimizing of code */}
        <div className="flex gap-2 flex-wrap " >
          {utilsButton.map((btn, i) => (
            <button
              key={i}
              onClick={() => handleUtilityPrompt(btn.prompt)}
              disabled={loading}
              className="bg-amber-400 rounded hover:bg-amber-500 disabled:opacity-50 p-2 text-black"
            >
              {btn.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div id="message" className="h-[70vh] overflow-auto p-3">
        {activeMessage?.map((msg, i) => (
          <div
            key={i}
            className={`w-full flex flex-col gap-2 mb-4 ${msg?.role === "user" ? "items-end" : "items-start"
              }`}
          >
            <div
              className={`w-[90%] w-fit-content min-w-0 rounded-xl px-3.5 py-2.5 shadow-sm leading-relaxed border overflow-hidden ${msg?.role === "user"
                ? "bg-[#1E1B4B] text-indigo-100 border-[#312E81] rounded-tr-none"
                : "bg-[#1C1C21] text-zinc-200 border-[#2E2E35] rounded-tl-none"
                }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
                {msg?.role === "user" ? "You" : "Assistant"}
              </div>
              <div className="text-sm break-words w-full overflow-hidden">
                <AiStructure content={msg?.content} />
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="w-full flex items-start mb-4">
            <div className="rounded max-w-2xl p-3 text-white flex items-center gap-2">
              <Loader />
              <p className="text-sm animate-pulse"> AI is typing...</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div >

      {/* Input */}
      <div className="w-full h-16 flex gap-2 p-2 bg-[#252426] absolute bottom-0">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
          className="w-4/5 h-full bg-[#0E0E0E] text-white p-2 rounded resize-none"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="h-full w-24 bg-amber-400 rounded hover:bg-amber-500 disabled:opacity-50 text-black font-semibold"
        >
          {loading ? "⏳" : "Send"}
        </button>
      </div>
    </div>
  );
};

export default AiChat;
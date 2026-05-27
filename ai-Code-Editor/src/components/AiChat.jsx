import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContextInstance";
import Loader from "./Loader";
import AiStructure from "./AiStructure";
import { codeBase } from "../store/codeBase";
import { useParams } from "react-router-dom";

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
    <div className="h-screen bg-[#201F20] text-white relative">
      {/* Header */}
      <div className="bg-[#252426] p-2 h-[22vh] w-full">
        <h1 className="text-xl m-2">AI Assistant</h1>

        <div className="flex gap-2 flex-wrap">
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
        { activeMessage?.map((msg, i) => (
          <div
            key={i}
            className={`w-full flex flex-col gap-2 mb-4 ${
              msg?.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`rounded max-w-full overflow-hidden p-3 ${
                msg?.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-[#252426] text-white"
              }`}
            >
              <AiStructure content={msg?.content} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="w-full flex items-start mb-4">
            <div className="rounded max-w-2xl p-3 text-white">
              <Loader />
            </div>
          </div>
        )}
      </div>

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
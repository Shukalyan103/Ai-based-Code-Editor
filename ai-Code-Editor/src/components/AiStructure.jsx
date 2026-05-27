import React, { useState, useContext } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { AppContext } from '../context/AppContextInstance';

const AiStructure = ({ content }) => {
  const { editText } = useContext(AppContext);
  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);

  let parsed = null;
  let isJson = false;

  const contentStr = typeof content === 'string' ? content.trim() : '';

  if (contentStr.startsWith('{')) {
    try {
      parsed = JSON.parse(contentStr);
      if (parsed.code !== undefined || parsed.explanation !== undefined || parsed.suggestion !== undefined) {
        isJson = true;
      }
    } catch (e) {
      // Lenient clean-up parse in case of newlines in string properties
      try {
        const cleaned = contentStr
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r');
        parsed = JSON.parse(cleaned);
        if (parsed.code !== undefined || parsed.explanation !== undefined || parsed.suggestion !== undefined) {
          isJson = true;
        }
      } catch (err) {
        // Fallback to regular markdown
      }
    }
  }

  const handleCopy = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = (codeText) => {
    if (editText) {
      editText(codeText);
      setInserted(true);
      setTimeout(() => setInserted(false), 2000);
    }
  };

  if (isJson && parsed) {
    const { code, explanation, suggestion } = parsed;

    return (
      <div className="flex flex-col gap-4 text-white max-w-full">
        {/* Explanation Section */}
        {explanation && (
          <div className="text-sm leading-relaxed text-gray-200">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        )}

        {/* Code Section */}
        {code && code.trim() && (
          <div className="border border-[#3E3D40] rounded-xl overflow-hidden bg-[#1E1E1E]">
            {/* Code Header Actions */}
            <div className="flex items-center justify-between bg-[#2d2c2e] px-4 py-2 border-b border-[#3E3D40]">
              <span className="text-xs text-amber-400 font-mono flex items-center gap-1.5 font-bold">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Suggested Changes
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(code)}
                  className="flex items-center gap-1 text-xs bg-[#3a393b] hover:bg-[#4a494b] text-gray-200 px-2 py-1.5 rounded transition font-medium"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleInsert(code)}
                  className="flex items-center gap-1 text-xs bg-amber-400 hover:bg-amber-500 text-black px-2 py-1.5 rounded transition font-bold"
                >
                  {inserted ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Applied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Insert Code
                    </>
                  )}
                </button>
              </div>
            </div>
            {/* Highlighted Code */}
            <div className="text-sm overflow-x-auto">
              <SyntaxHighlighter
                language="javascript"
                style={oneDark}
                customStyle={{ margin: 0, padding: '1rem', background: '#121212' }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {/* Suggestion Section */}
        {suggestion && suggestion.trim() && (
          <div className="flex gap-2.5 bg-[#2E281F] border-l-4 border-amber-400 p-3 rounded-r-xl">
            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">AI Suggestion</span>
              <span className="text-xs text-gray-200 leading-relaxed font-mono">
                {suggestion}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Otherwise, render default markdown view
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-4xl font-bold mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>
        ),
        p: ({ children }) => (
          <p className="text-base leading-7 mb-3">{children}</p>
        ),
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <div className="border border-[#3E3D40] rounded-xl overflow-hidden bg-[#1E1E1E] my-3">
              <div className="flex items-center justify-between bg-[#2d2c2e] px-4 py-2 border-b border-[#3E3D40]">
                <span className="text-xs text-amber-400 font-mono font-bold">{match[1]} code</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(String(children).replace(/\n$/, ''))}
                    className="flex items-center gap-1 text-xs bg-[#3a393b] hover:bg-[#4a494b] text-gray-200 px-2 py-1 rounded transition"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => handleInsert(String(children).replace(/\n$/, ''))}
                    className="flex items-center gap-1 text-xs bg-amber-400 hover:bg-amber-500 text-black px-2 py-1 rounded transition font-bold"
                  >
                    Insert Code
                  </button>
                </div>
              </div>
              <SyntaxHighlighter
                language={match[1]}
                style={oneDark}
                customStyle={{ margin: 0, padding: '1rem', background: '#121212' }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-amber-400" {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => <>{children}</>,
        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-3">{children}</ul>
        ),
        li: ({ children }) => <li className="mb-1">{children}</li>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default AiStructure;
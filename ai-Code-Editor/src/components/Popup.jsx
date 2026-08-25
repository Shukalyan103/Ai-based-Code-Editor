import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { codeBase } from '../store/codeBase';
import { useShallow } from 'zustand/react/shallow';
import { AppContext } from '../context/AppContextInstance';
import { Sparkles, X, Folder, Globe, Code2, Terminal, Check, ArrowRight } from 'lucide-react';

const templates = [
    {
        id: 'blank',
        name: 'Blank Slate',
        description: 'A completely empty project workspace to build from scratch.',
        icon: Folder,
        iconColor: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
    },
    {
        id: 'web',
        name: 'Web Starter',
        description: 'Classic HTML5, CSS3, and JavaScript project setup.',
        icon: Globe,
        iconColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    },
    {
        id: 'react',
        name: 'React App',
        description: 'Lightweight React JSX starter files to build single-page apps.',
        icon: Code2,
        iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
        id: 'algo',
        name: 'Algo Sandbox',
        description: 'A clean sandbox with an index.js solution file and markdown description.',
        icon: Terminal,
        iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    }
];

const Popup = ({ onClose }) => {
    const navigate = useNavigate();
    const { setFileCount } = useContext(AppContext);
    const [mounted, setMounted] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('blank');
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const { project, addProject, createFile, updateCode } = codeBase(
        useShallow(state => ({
            project: state.project,
            addProject: state.addProject,
            createFile: state.createFile,
            updateCode: state.updateCode,
        }))
    );

    // Animate mount transition
    useEffect(() => {
        setMounted(true);
    }, []);

    // Listen for Escape key to close the modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Validates workspace name in real-time
    useEffect(() => {
        if (!projectName.trim()) {
            setError('');
            return;
        }

        if (/[/\\?%*:|"<> ]/.test(projectName)) {
            setError('Name cannot contain spaces, slashes, or special characters (?%*:|"<>)');
            return;
        }

        if (project[projectName.trim()]) {
            setError('A workspace with this name already exists');
            return;
        }

        setError('');
    }, [projectName, project]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const name = projectName.trim();
        if (!name || error) return;

        setIsCreating(true);

        // Give UI a micro-second to register loading state
        setTimeout(() => {
            // 1. Create the project
            addProject(name);

            // 2. Pre-populate template files & folders
            let totalFilesCreated = 0;

            if (selectedTemplate === 'web') {
                createFile(name, 'index.html');
                updateCode(name, 'index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Starter Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <div class="logo">🌐</div>
    <h1>Web Starter Workspace</h1>
    <p>Your interactive web environment is ready. Edit files and see updates.</p>
    <button id="actionBtn">Click to Interact</button>
    <p id="status" class="status-text"></p>
  </div>
  <script src="script.js"></script>
</body>
</html>`);

                createFile(name, 'style.css');
                updateCode(name, 'style.css', `body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #0f0f11;
  color: #f4f4f6;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.card {
  background: #18181c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 2.5rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  max-width: 400px;
}
.logo {
  font-size: 3rem;
  margin-bottom: 1rem;
}
h1 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: #fff;
}
p {
  color: #9a9ab0;
  font-size: 0.9rem;
  line-height: 1.5;
}
button {
  background: #6b69da;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: background 0.2s;
}
button:hover {
  background: #5a58c9;
}
.status-text {
  margin-top: 1rem;
  font-weight: 500;
  color: #34d399;
  min-height: 20px;
}
`);

                createFile(name, 'script.js');
                updateCode(name, 'script.js', `// Welcome to your Web Starter Project!
console.log("Web Starter initialized successfully.");

const button = document.getElementById("actionBtn");
const statusText = document.getElementById("status");

if (button) {
  button.addEventListener("click", () => {
    statusText.textContent = "Hello! Interactive script is working 🎉";
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "none";
    }, 150);
  });
}
`);
                totalFilesCreated = 3;
            }
            else if (selectedTemplate === 'react') {
                createFile(name, 'package.json');
                updateCode(name, 'package.json', `{
  "name": "${name.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.11"
  }
}`);

                createFile(name, 'index.html');
                updateCode(name, 'index.html', `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`);

                createFile(name, 'vite.config.js');
                updateCode(name, 'vite.config.js', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});`);

                createFile(name, 'src/main.jsx');
                updateCode(name, 'src/main.jsx', `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`);

                createFile(name, 'src/App.jsx');
                updateCode(name, 'src/App.jsx', `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');

  return (
    <div className="container">
      <div className="react-logo">⚛️</div>
      <h1>React Workspace</h1>
      <p>Start building your component-driven UI with AI support & WebContainer preview.</p>
      
      <div className="interactive">
        <button className="btn" onClick={() => {
          setCount(c => c + 1);
          setMessage('State updated in real-time with HMR!');
        }}>
          Count is {count}
        </button>
        {message && <p className="msg">{message}</p>}
      </div>
    </div>
  );
}
`);

                createFile(name, 'src/index.css');
                updateCode(name, 'src/index.css', `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #0b0b0d;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.container {
  text-align: center;
  background: #141416;
  border: 1px solid #232326;
  padding: 3rem;
  border-radius: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
.react-logo {
  font-size: 3.5rem;
  animation: spin 8s linear infinite;
  display: inline-block;
  margin-bottom: 1rem;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
h1 {
  font-size: 1.75rem;
  margin: 0;
}
p {
  color: #8c8c9e;
  font-size: 0.95rem;
  margin: 0.5rem 0 2rem 0;
}
.btn {
  background: linear-gradient(135deg, #00d2ff, #0066ff);
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn:hover {
  opacity: 0.9;
}
.msg {
  color: #00d2ff;
  font-size: 0.85rem;
  margin-top: 1rem;
}
`);
                totalFilesCreated = 6;
            }
            else if (selectedTemplate === 'algo') {
                createFile(name, 'index.js');
                updateCode(name, 'index.js', `/**
 * Problem: Two Sum
 * 
 * Given an array of integers 'nums' and an integer 'target', return indices
 * of the two numbers such that they add up to 'target'.
 * You may assume that each input would have exactly one solution, and you
 * may not use the same element twice.
 * 
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test case execution
const nums = [2, 7, 11, 15];
const target = 9;
const result = twoSum(nums, target);

console.log("--- Two Sum Solver ---");
console.log("Input array:", nums);
console.log("Target value:", target);
console.log("Result indices:", result); // Expected: [0, 1]
console.log("Check verification:", nums[result[0]] + nums[result[1]] === target ? "PASSED ✅" : "FAILED ❌");
`);

                createFile(name, 'README.md');
                updateCode(name, 'README.md', `# Algorithm Sandbox 🧠

Welcome to your algorithm sandbox workspace! This workspace contains a template challenge to test solutions in JavaScript.

## Challenge: Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

### Constraints
* Each input has exactly one solution.
* You may not use the same element twice.
* You can return the answer in any order.

### Run Configuration
Press the run button or ask the AI to optimize or translate this implementation to other programming languages.
`);
                totalFilesCreated = 2;
            }

            // 3. Update active state, navigation & close modal
            setFileCount(totalFilesCreated);
            setIsCreating(false);
            navigate(`/editor/${name}`);
            if (onClose) onClose();
        }, 400);
    };

    return (
        <div
            onClick={handleBackdropClick}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${mounted ? 'opacity-100' : 'opacity-0'
                }`}
        >
            <div
                className={`relative w-full max-w-2xl bg-[#161619] border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 text-white max-h-[90vh] overflow-y-auto transform transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${mounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Dialog Header */}
                <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
                        <Sparkles className="w-5.5 h-5.5" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100">
                            Create a New Workspace
                        </h2>
                        <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                            Design a workspace template or start with a clean slate. Your files will be created in real time with built-in AI support.
                        </p>
                    </div>
                </div>

                {/* Workspace Form */}
                <form onSubmit={handleCreate} className="flex flex-col gap-6">
                    {/* Name Input */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="workspace-name" className="text-sm font-semibold text-zinc-300">
                            Workspace Name
                        </label>
                        <input
                            id="workspace-name"
                            type="text"
                            required
                            autoFocus
                            placeholder="e.g. ecommerce-dashboard"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className={`w-full px-4 py-3 bg-zinc-900/60 border rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all ${error
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                : 'border-zinc-800 hover:border-zinc-700 focus:border-[#6B69DA] focus:ring-1 focus:ring-[#6B69DA]'
                                }`}
                        />
                        {error && (
                            <span className="text-xs font-medium text-red-400 animate-pulse mt-0.5">
                                {error}
                            </span>
                        )}
                    </div>

                    {/* Template Grid */}
                    <div className="flex flex-col gap-3">
                        <span className="text-sm font-semibold text-zinc-300">Select Starter Template</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {templates.map((tpl) => {
                                const Icon = tpl.icon;
                                const isSelected = selectedTemplate === tpl.id;
                                return (
                                    <div
                                        key={tpl.id}
                                        onClick={() => setSelectedTemplate(tpl.id)}
                                        className={`group relative flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${isSelected
                                            ? 'border-[#6B69DA] bg-[#6B69DA]/8 shadow-[0_0_20px_-8px_rgba(107,105,218,0.25)]'
                                            : 'border-zinc-800/80 bg-zinc-900/20 hover:bg-zinc-900/55 hover:border-zinc-700'
                                            }`}
                                    >
                                        {/* Template Icon */}
                                        <div
                                            className={`flex items-center justify-center w-10 h-10 rounded-lg border shrink-0 transition-transform group-hover:scale-105 duration-200 ${tpl.iconColor}`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        {/* Template Labels */}
                                        <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                                            <span className="text-sm font-bold text-zinc-200 group-hover:text-zinc-100 transition-colors">
                                                {tpl.name}
                                            </span>
                                            <span className="text-xs text-zinc-400 leading-normal">
                                                {tpl.description}
                                            </span>
                                        </div>

                                        {/* Selection Checkmark */}
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-[#6B69DA] text-white">
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-3 pt-4 border-t border-zinc-800/80">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isCreating}
                            className="px-5 py-2.5 rounded-xl border border-zinc-800 bg-transparent text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/50 hover:border-zinc-700 disabled:opacity-50 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || !projectName.trim() || !!error}
                            className="group relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B69DA] to-[#8E8DED] hover:opacity-95 text-sm font-bold text-white shadow-lg shadow-[#6B69DA]/20 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                            {isCreating ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Initializing...
                                </>
                            ) : (
                                <>
                                    Create Workspace
                                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Popup;
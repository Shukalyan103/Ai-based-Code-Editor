import { useContext, useState, useEffect } from "react"
import { AppContext } from "../context/AppContextInstance"
import { codeBase } from "../store/codeBase"
import { useNavigate } from "react-router-dom"

const PopupDeleRename = () => {
    const { popupOpen, setPopUpOpen } = useContext(AppContext)
    const activeProject = codeBase((state) => state.activeProject);
    const navigate = useNavigate()

    const [renameInput, setRenameInput] = useState("")

    useEffect(() => {
        if (popupOpen === "rename" && activeProject) {
            setRenameInput(activeProject);
        }
    }, [popupOpen, activeProject]);

    if (!popupOpen) return null;

    const handleRenameSubmit = () => {
        const trimmed = renameInput.trim();
        if (trimmed && trimmed !== activeProject) {
            codeBase.getState().renameProject(activeProject, trimmed);
            setPopUpOpen(null);
            navigate('/');
        } else if (trimmed === activeProject) {
            setPopUpOpen(null);
        }
    };

    const handleDeleteSubmit = () => {
        if (activeProject) {
            codeBase.getState().deleteProject(activeProject);
            setPopUpOpen(null);
            navigate('/');
        }
    };

    if (popupOpen === "delete") {
        return (
            <div className="h-screen w-full flex justify-center bg-black/30 absolute top-0 left-0 z-50 items-center">
                <div className="h-[35vh] w-[60vh] bg-black/20 flex flex-col justify-between backdrop-blur-lg backdrop-saturate-100 backdrop-contrast-100 rounded-xl p-4 border border-gray-200/20">
                    <div className="flex flex-col gap-8">
                        <h1 className="text-gray-400 text-xl font-bold">Delete this project ?</h1>
                        <p className="text-gray-400 font-semibold">
                            You are about to delete <span className="text-white">[{activeProject}]</span> project. Are you sure you want to delete it ?
                        </p>
                    </div>

                    <div className="flex gap-4 justify-end w-full p-3">
                        <button
                            className="w-fit px-5 py-2 rounded-xl border border-gray-300/20 text-white cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setPopUpOpen(null)}
                        >
                            Cancel
                        </button>
                        <button
                            className="w-fit px-5 py-2 rounded-xl border border-gray-300/20 bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-colors"
                            onClick={handleDeleteSubmit}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (popupOpen === "rename") {
        return (
            <div className="h-screen w-full flex justify-center bg-black/30 absolute top-0 left-0 z-50 items-center">
                <div className="h-[35vh] w-[60vh] bg-black/20 flex flex-col justify-between backdrop-blur-lg backdrop-saturate-100 backdrop-contrast-100 rounded-xl p-4 border border-gray-200/20">
                    <div className="flex flex-col gap-6">
                        <h1 className="text-gray-400 text-xl font-bold">Rename {activeProject}</h1>
                        <input
                            type="text"
                            className="p-4 w-full bg-inherit outline-none border border-gray-300/20 rounded-xl focus:border-blue-500 transition-all ease-in-out duration-300 text-white"
                            placeholder={activeProject || "Project name..."}
                            value={renameInput}
                            autoFocus
                            onChange={(e) => setRenameInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleRenameSubmit();
                                } else if (e.key === "Escape") {
                                    setPopUpOpen(null);
                                }
                            }}
                        />
                    </div>

                    <div className="flex gap-4 justify-end w-full p-3">
                        <button
                            className="w-fit px-5 py-2 rounded-xl border border-gray-300/20 text-white cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setPopUpOpen(null)}
                        >
                            Cancel
                        </button>
                        <button
                            className="w-fit px-5 py-2 rounded-xl border border-gray-300/20 bg-blue-700 hover:bg-blue-800 text-white cursor-pointer transition-colors"
                            onClick={handleRenameSubmit}
                        >
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default PopupDeleRename;
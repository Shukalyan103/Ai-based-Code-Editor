import { useRef, useState } from "react";
import { editStore } from '../store/editStore';
import { codeBase } from '../store/codeBase';
import { AppContext } from "./AppContextInstance";



export const AppContextProvider = (props) => {

    const updateMessage = codeBase((state) => state.updateMessage)
    const editorRef = useRef(null)
    const [loading, setLoading] = useState(false)
    const [fileCount, setFileCount] = useState(0)

    const [popupOpen, setPopUpOpen] = useState('')

    const getSelectedtext = () => {
        const editor = editorRef.current
        if (editor) {
            const selection = editor.getSelection()
            const model = editor.getModel()
            const selectedText = model.getValueInRange(selection)
            console.log(selectedText)
            return selectedText
        }
        return ""
    }
    const editText = (text) => {
        const model = editorRef.current.getModel()
        const selection = editorRef.current.getSelection()

        const newText = text
        model.pushEditOperations([], [
            {
                range: selection,
                text: newText,
                forceMoveMarkers: true
            }
        ], () => {
            return null
        })


    }

    const buttonPromtCode = async (code, promt) => {
        if (!promt) {
            console.log('promt is required')
            return
        }
        try {
            const currentActiveProject = codeBase.getState().activeProject
            if (!currentActiveProject) {
                console.warn('No active project selected to associate chat messages with.');
                return;
            }
            const store = codeBase.getState()
            console.log(store)

            // Format prompt beautifully to display in the chat panel
            const displayPrompt = code
                ? `${promt}\n\nSelected Code:\n\`\`\`javascript\n${code}\n\`\`\``
                : promt;

            store.updateMessage(currentActiveProject, {
                "role": "user",
                "content": displayPrompt
            })
            store.updateMessage(currentActiveProject, {
                "role": "ai",
                "content": " "
            })

            setLoading(true)

            const res = await fetch('http://localhost:3000/ai/get-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: code || "", promt })
            })
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const reader = res.body.getReader()
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read()
                if (done) break;
                const chunk = decoder.decode(value)
                store.appendMessageChunk(currentActiveProject, chunk)
            }

            setLoading(false)

        } catch (e) {
            console.error('Fetch error:', e)
            setLoading(false)
        }

    }

    const promtCode = async (promt) => {
        if (!promt) {
            return
        }
        try {
            const currentActiveProject = codeBase.getState().activeProject
            if (!currentActiveProject) {
                console.warn('No active project selected to associate chat messages with.');
                return;
            }
            const store = codeBase.getState()

            store.updateMessage(currentActiveProject, {
                role: "user",
                content: promt
            })

            setLoading(true)

            const res = await fetch('http://localhost:3000/ai/get-PromtData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ promt })
            })
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
            const data = await res.json()

            store.updateMessage(currentActiveProject, {
                role: "ai",
                content: data
            })

            console.log(data)
            setLoading(false)

        } catch (e) {
            console.error('Promt Error:', e)
            setLoading(false)

        }
    }






    const value = {
        editorRef, getSelectedtext, editText, buttonPromtCode, loading, promtCode, setFileCount, fileCount, popupOpen, setPopUpOpen
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
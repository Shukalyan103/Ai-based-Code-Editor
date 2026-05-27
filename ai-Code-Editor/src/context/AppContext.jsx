import { useRef, useState } from "react";
import { editStore } from '../store/editStore';
import { codeBase } from '../store/codeBase';
import { AppContext } from "./AppContextInstance";



export const AppContextProvider = (props) => {

   const updateMessage = codeBase((state)=>state.updateMessage)
    const editorRef = useRef(null)
    const [loading,setLoading]=useState(false)

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
            
            // Format prompt beautifully to display in the chat panel
            const displayPrompt = code 
                ? `${promt}\n\nSelected Code:\n\`\`\`javascript\n${code}\n\`\`\``
                : promt;

            updateMessage(currentActiveProject, "user", displayPrompt)

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
            const data = await res.json()
            updateMessage(currentActiveProject, "ai", data)
           
            console.log(data)
            setLoading(false)
            
        } catch (e) {
            console.error('Fetch error:', e)
            setLoading(false)
        }

    }

    const promtCode=async(promt)=>{
        if(!promt){
            return
        }
        try{
            const currentActiveProject = codeBase.getState().activeProject
            updateMessage(currentActiveProject, "user", promt)

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
            updateMessage(currentActiveProject, "ai", data)
           
            console.log(data)
            setLoading(false)

        }catch(e){
            console.error('Promt Error:', e)
            setLoading(false)
            
        }
    }






    const value = {
        editorRef, getSelectedtext, editText, buttonPromtCode,loading,promtCode
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
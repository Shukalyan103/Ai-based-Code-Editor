import React, { useContext, useState } from 'react'
import { codeBase } from '../store/codeBase'
import { Link } from 'react-router-dom'
import ProjectBox from '../components/ProjectBox'
import {
  Code2,
  Plus,
  Sparkles,
  Layers,
  Activity,
  ArrowRight,
  FolderPlus
} from 'lucide-react';
import { AppContext } from '../context/AppContextInstance';
import Popup from '../components/Popup';
import ImportZip from '../components/ImportZip';
import PopupDeleRename from '../components/PopupDeleRename';

const Dashboard = () => {
  const project = codeBase(state => state.project)
  const addProject = codeBase(state => state.addProject)
  const setActiveProject = codeBase(state => state.setActiveProject)
  const { fileCount } = useContext(AppContext)

  const [pop, setPop] = useState(false)







  return (
    <div className='min-h-screen  bg-[#131314] text-white flex flex-col items-start relative'>
      <div className='nav h-[10vh] w-full bg-black'>
        <div className='flex h-full items-center ml-5 gap-3'>
          <div className="box p-1 bg-[#6B69DA] rounded-lg">
            <Code2 className='text-white' />
          </div>

          <h1 className='text-2xl font-bold tracking-wider'>Code Editor</h1>

        </div>
      </div>

      <div className='h-[87%] w-full p-3'>
        {/* hero box */}
        <div className='w-full flex  items-center justify-center '>
          <div className='w-3/4 bg-black/80 h-50 rounded-lg p-3 flex items-center justify-between'>
            <div className='w-1/2 p-4 flex flex-col items-start gap-3'>
              <h3 className='flex items-center gap-3 '><Sparkles className='text-green-300' /> <span className='font-semibold text-2xl'>Start a new AI project</span></h3>
              <p className='text-sm mt-3 text-gray-400 font-medium'>Welcome back to your workspace. Write, Refractor and translate your code with real-time AI assistance</p>
            </div>
            <ImportZip />
          </div>



        </div>

        {/* project Details */}
        <div className='w-full h-[10vh] mt-5  flex items-center gap-1 justify-center  '>
          <div className='h-full w-1/4 bg-black/40 rounded-lg flex items-center gap-3 p-4'>
            <div className='h-[80%] w-[10%]  rounded-lg flex bg-amber-500/10 text-amber-400 items-center justify-center'>
              <Activity className=' "w-3.5 h-3.5 ' />
            </div>
            <div className='flex flex-col justify-start'>
              <span className='text-xs text-gray-400 font-medium'>Total Projects</span>
              <span className='text-xl font-bold'>{Object.keys(project).length}</span>
            </div>
          </div>
          <div className='h-full w-1/4 bg-black/40 rounded-lg flex items-center gap-3 p-4'>
            <div className='h-[80%] w-[10%]  bg-green-500/10 text-green-400 rounded-lg flex  items-center justify-center'>
              <Layers className='w-3.5 h-3.5 ' />
            </div>
            <div className='flex flex-col justify-start'>
              <span className='text-xs text-gray-400 font-medium'>TOTAL WORKSPACE FILES</span>
              <span className='text-xl font-bold'>{Object.values(project).reduce((acc, curr) => acc + Object.keys(curr.files || {}).length, 0)}</span>
            </div>
          </div>
          <div className='h-full w-1/4 bg-black/40 rounded-lg flex items-center gap-3 p-4'>
            <div className='h-[80%] w-[10%]  rounded-lg flex bg-black bg-clip-padding backdrop-filter  backdrop-blur bg-opacity-10 backdrop-saturate-100 backdrop-contrast-100 items-center justify-center'>
              <Activity className=' text-white/40   rounded' />
            </div>
            <div className='flex flex-col justify-start'>
              <span className='text-xs text-gray-400 font-medium'>Total Projects</span>
              <span className='text-xl font-bold'>{Object.keys(project).length}</span>
            </div>
          </div>


        </div>


        {/* All Projects */}
        <div className='min-h-[90%] w-full p-5  flex  gap-6 flex-wrap pl-14 pt-7 '>

          <div
            onClick={() => {
              setPop(true)

            }}
            className="group bg-transparent hover:bg-[#18181C]/30 border-2 border-dashed border-[#27272A] hover:border-[#6B69DA]/60 rounded-2xl p-6 h-[200px] w-[280px] flex flex-col items-center justify-center gap-3.5 transition-all duration-300 cursor-pointer text-center"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#18181C] border border-[#27272A] group-hover:border-[#6B69DA]/30 group-hover:bg-[#1D1B2D] text-gray-400 group-hover:text-[#8E8DED] transition-all">
              <FolderPlus className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white group-hover:text-[#8E8DED] transition-colors">
                Create Workspace
              </span>
              <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                Click to add a new project
              </span>
            </div>
          </div>
          {Object.keys(project).map((projectName, i) => {
            return <Link key={i} to={`/editor/${projectName}`} onClick={() => {
              setActiveProject(projectName)
            }}>
              <ProjectBox content={projectName} />
            </Link>
          })}

        </div>

      </div>

      {/* Popup */}
      {pop && <Popup onClose={() => setPop(false)} />}
      <PopupDeleRename />

    </div>
  )
}

export default Dashboard
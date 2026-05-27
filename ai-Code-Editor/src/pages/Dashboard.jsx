import React from 'react'
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

const Dashboard = () => {
  const project = codeBase(state => state.project)
  const addProject = codeBase(state => state.addProject)
  const setActiveProject = codeBase(state => state.setActiveProject)
  console.log(project)
  return (
    <div className='min-h-screen  bg-[#131314] text-white flex flex-col items-start'>
      <div className='nav h-[10vh] w-full bg-black'></div>

      <div className='h-[87%] w-full p-3'>
        <div className='flex items-center justify-between'>
          <div className='p-3'>
            <h1 className='text-xl font-bold '>Dashboard</h1>
          </div>
          <button className='h-[6vh] w-[10vw] rounded bg-[#6B69DA] mr-3 cursor-pointer' onClick={() => {
            const projectName = prompt("Enter project name")
            if (projectName) {
              addProject(projectName)
            }
          }}>New Project</button>
        </div>
        <div className='min-h-[90%] w-full p-5  flex  gap-6 flex-wrap'>

          <div
            onClick={() => {
              const projectName = prompt("Enter project name")
              if (projectName) {
                addProject(projectName)
              }
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

    </div>
  )
}

export default Dashboard
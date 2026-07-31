import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { codeBase } from '../store/codeBase';
import { useShallow } from 'zustand/react/shallow';
import { Panel, Group, Separator } from 'react-resizable-panels';
import {
  FolderCode,
  Languages,
  MessageSquare,
  Home,
  ChevronLeft,
  ChevronRight,
  FileCode2,
  Settings
} from 'lucide-react';
import SideBar from '../components/SideBar';
import CodeEiditor from '../components/CodeEiditor';
import AiChat from '../components/AiChat';
import TranslateCode from '../components/TranslateCode';
import PopupDeleRename from '../components/PopupDeleRename';
import { AppContext } from '../context/AppContextInstance';


const Editor = () => {
  const { ProjectName } = useParams();
  const activeProject = codeBase((state) => state.activeProject);
  const setActiveProject = codeBase((state) => state.setActiveProject);
  const project = codeBase((state) => state.project);
  const addProject = codeBase((state) => state.addProject);
  const { setPopUpOpen } = useContext(AppContext)

  useEffect(() => {
    if (ProjectName) {
      const store = codeBase.getState();
      if (!store.project[ProjectName]) {
        store.addProject(ProjectName);
      } else if (store.activeProject !== ProjectName) {
        store.setActiveProject(ProjectName);
      }
    }
  }, [ProjectName]);

  const navigate = useNavigate()


  const [sideBarVisible, setSideBarVisible] = useState('file')
  const [contextMenuEnable, setContextMenuEnable] = useState(null)

  const hidecontext = (word) => {
    if (contextMenuEnable === 'context') {
      setContextMenuEnable(null)
    } else {
      setContextMenuEnable(word)
    }
  }

  // delete and rename file context menu
  const FileContext = () => {

    return (
      <>
        <div className="h-fit  w-fit text-white font-semibold  border-1 border-gray-500/20 absolute left-[30px] top-[-95px] flex items-center flex-col rounded top-0 bg-[#131314]">
          <button className="  cursor-pointer p-3 hover:bg-[#2F2F32] rounded border-1 border-gray-500/20" onClick={() => {
            setPopUpOpen("rename")
          }} >Rename</button>

          <button className=" cursor-pointer p-3 w-full hover:bg-[#2F2F32] rounded border-1 border-gray-500/20" onClick={() => {
            setPopUpOpen("delete")
          }
          }>Delete</button>
          <button className=" cursor-pointer p-3 w-full hover:bg-[#2F2F32] rounded border-1 border-gray-500/20" onClick={() => { }
          }>Export</button>


        </div>
      </>
    )

  }

  const sideBarChangeHandler = (name) => {
    if (sideBarVisible === name) {
      setSideBarVisible(null); // Collapse if already open
    } else {
      setSideBarVisible(name); // Switch active tab ('file', 'translate', 'chat')
    }
  };

  return (
    <div className='h-screen w-full relative '>

      {/* <div className='h-[6%] w-full'></div> */}
      <div className='h-[100%] w-full flex'>
        {/* Navigation box of sidebar */}

        <div className='h-full w-[8vh]  flex items-center justify-start flex-col pt-3 relative'>
          <div className=' bg-blue-500 rounded-lg p-2 text-white'>
            <Home onClick={() => { navigate('/') }} className='text-white ' />
          </div>

          {/* Buttons for Ide */}
          <div className='h-[85%]'>
            <div className='flex items-center gap-4  flex-col mt-4 '>
              <FolderCode onClick={() => {
                sideBarChangeHandler('file')
              }} className={`cursor-pointer p-2 h-full w-[2.5vw] transition-all ease-in-out duration-300  ${sideBarVisible == 'file' ? 'text-amber-400 bg-gray-500/40 w-6 h-6 rounded-lg ' : 'text-white'}`} />
              <Languages onClick={() => {
                sideBarChangeHandler('translate')
              }} className={`cursor-pointer p-2 h-full w-[2.5vw] transition-all ease-in-out duration-300 ${sideBarVisible == 'translate' ? 'text-amber-400 w-6 h-6 rounded-lg bg-gray-500/40' : 'text-white'}`} />

            </div>
          </div>
          {/* setting for rename & delete */}
          <div className="relative" onClick={() => { hidecontext('context') }}>
            <Settings className='text-white cursor-pointer' />
            {contextMenuEnable === 'context' ? <FileContext /> : null}
          </div>


        </div>
        <div className='h-full w-[97%] '>
          <Group direction="horizontal">
            {sideBarVisible == 'file' ? (
              <Panel minSize={20}>
                <SideBar />
              </Panel>
            ) : sideBarVisible == 'translate' ? (
              <Panel minSize={20} >
                <TranslateCode />
              </Panel>
            ) : null}



            <Separator />
            <Panel minSize={100}><CodeEiditor className='overflow-hidden' /></Panel>
            <Panel minSize={50}><AiChat /></Panel>
          </Group>

        </div>
      </div>
      {/* footer line number , language */}
      {/* <div className='h-[4%] w-full'></div> */}
      <PopupDeleRename />
    </div>
  )
};

export default Editor; 
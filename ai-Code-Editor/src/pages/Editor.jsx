import React, { useState, useEffect } from 'react';
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
  FileCode2
} from 'lucide-react';
import SideBar from '../components/SideBar';
import CodeEiditor from '../components/CodeEiditor';
import AiChat from '../components/AiChat';
import TranslateCode from '../components/TranslateCode';


const Editor = () => {
  const { ProjectName } = useParams();
  const activeProject = codeBase((state) => state.activeProject);
  const setActiveProject = codeBase((state) => state.setActiveProject);
  const project = codeBase((state) => state.project);
  const addProject = codeBase((state) => state.addProject);

  useEffect(() => {
    if (ProjectName && activeProject !== ProjectName) {
      if (!project[ProjectName]) {
        addProject(ProjectName);
      } else {
        setActiveProject(ProjectName);
      }
    }
  }, [ProjectName, activeProject, project, setActiveProject, addProject]);

  const navigate = useNavigate()


  const [sideBarVisible, setSideBarVisible] = useState('file')

  const sideBarChangeHandler = (name) => {
    if (sideBarVisible === name) {
      setSideBarVisible(null); // Collapse if already open
    } else {
      setSideBarVisible(name); // Switch active tab ('file', 'translate', 'chat')
    }
  };

  return (
    <div className='h-screen w-full flex '>
      {/* Navigation box of sidebar */}
      <div className='h-full w-[8vh] bg-red-500 flex items-center justify-start flex-col pt-3'>
        <div>
          <Home />
        </div>

        {/* Buttons for Ide */}

        <div className='flex items-center gap-4 flex-col mt-4 '>
          <FolderCode onClick={() => {
            sideBarChangeHandler('file')
          }} />
          <Languages onClick={() => {
            sideBarChangeHandler('translate')
          }} />

        </div>
      </div>
      <div className='h-full w-full '>
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
  )
};

export default Editor; 
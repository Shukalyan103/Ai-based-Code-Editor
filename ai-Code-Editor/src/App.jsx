import React, { useEffect } from 'react'
import { Panel, Group, Separator } from 'react-resizable-panels';
import SideBar from './components/SideBar';
import CodeEiditor from './components/CodeEiditor';
import AiChat from './components/AiChat';
import { Route, Routes, useParams } from 'react-router-dom';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import { codeBase } from './store/codeBase';




const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />} />

      <Route path='/editor/:ProjectName' element={<Editor />} />
    </Routes>
  )

}

export default App
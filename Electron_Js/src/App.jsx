import { Link, Route, Router, Routes } from 'react-router-dom'
import './App.css'
import Hello from './pages/Hello'


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={< Hello/>} />
      </Routes>
    </>
  )
}

export default App

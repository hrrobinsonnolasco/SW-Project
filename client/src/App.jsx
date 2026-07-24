import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EmitterPage from './pages/EmitterPage'
import ReceiverPage from './pages/ReceiverPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmitterPage />} />
        <Route path="/stream/:id" element={<ReceiverPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

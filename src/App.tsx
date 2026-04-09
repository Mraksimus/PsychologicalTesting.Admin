import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "@/pages/Login.tsx"
import Main from "@/pages/Main.tsx"


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Main />} />
      </Routes>
    </BrowserRouter>
  )
}
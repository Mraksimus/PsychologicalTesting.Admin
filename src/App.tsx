import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "@/pages/Login.tsx"
import Home from "@/pages/home/Home.tsx"
import TestCreate from "@/pages/createTests/TestCreate"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tests/create" element={<TestCreate />} />
      </Routes>
    </BrowserRouter>
  )
}
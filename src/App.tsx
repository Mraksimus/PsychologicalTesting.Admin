import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "@/pages/Login.tsx"
import Home from "@/pages/home/Home.tsx"
import UsersPage from "@/pages/users/Users.tsx"
import TestsPage from "@/pages/tests/Tests.tsx"
import TestCreate from "@/pages/createTests/TestCreate"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/tests" element={<TestsPage />} />
        <Route path="/tests/create" element={<TestCreate />} />
      </Routes>
    </BrowserRouter>
  )
}
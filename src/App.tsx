import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "@/pages/Login.tsx"
import Home from "@/pages/home/Home.tsx"
import UsersPage from "@/pages/users/Users.tsx"
import TestsPage from "@/pages/tests/Tests.tsx"
import TestCreate from "@/pages/createTests/TestCreate"
import RolesPage from "@/pages/roles/Roles.tsx"
import { RequireAuth } from "@/api/auth-context.tsx"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAuth>
              <UsersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/roles"
          element={
            <RequireAuth>
              <RolesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/tests"
          element={
            <RequireAuth>
              <TestsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/tests/create"
          element={
            <RequireAuth>
              <TestCreate />
            </RequireAuth>
          }
        />
        <Route
          path="/tests/:testId"
          element={
            <RequireAuth>
              <TestCreate />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
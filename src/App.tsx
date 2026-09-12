import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "@/pages/Login.tsx"
import Home from "@/pages/home/Home.tsx"
import UsersPage from "@/pages/users/Users.tsx"
import TestsPage from "@/pages/tests/Tests.tsx"
import TestCreate from "@/pages/createTests/TestCreate"
import RolesPage from "@/pages/roles/Roles.tsx"
import SurveysPage from "@/pages/surveys/Surveys.tsx"
import SurveyCreate from "@/pages/surveys/SurveyCreate.tsx"
import SurveySessionsPage from "@/pages/surveys/SurveySessions.tsx"
import CategoriesPage from "@/pages/categories/Categories.tsx"
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
        <Route
          path="/surveys"
          element={
            <RequireAuth>
              <SurveysPage />
            </RequireAuth>
          }
        />
        <Route
          path="/surveys/create"
          element={
            <RequireAuth>
              <SurveyCreate />
            </RequireAuth>
          }
        />
        <Route
          path="/surveys/:surveyId"
          element={
            <RequireAuth>
              <SurveyCreate />
            </RequireAuth>
          }
        />
        <Route
          path="/surveys/:surveyId/sessions"
          element={
            <RequireAuth>
              <SurveySessionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/categories"
          element={
            <RequireAuth>
              <CategoriesPage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import LandingPage from "./pages/LandingPage"; // You might use this later
import AdminPage from "./pages/AdminPage";
import CountryPanel from "./components/CountryPanel";
import ExamPanel from "./components/ExamPanel";
import SubjectsPanel from "./components/SubjectsPanel";
import TopicsPanel from "./components/TopicsPanel";
import QuestionsPanel from "./components/QuestionsPanel";
import CourseTemplatePanel from "./components/CourseTemplatePanel";
import CostMonitoringPanel from "./components/CostMonitoringPanel";

export default function App() {
  return (
    // 1. Wrap the entire app in the Router component
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/admin" element={<AdminPage />}>
            <Route path="countries" element={<CountryPanel />} />
            <Route path="exams" element={<ExamPanel />} />
            <Route path="subjects" element={<SubjectsPanel />} />
            <Route path="topics" element={<TopicsPanel />} />
            <Route path="onboarding-quizzes" element={<QuestionsPanel />} />
            <Route path="course-templates" element={<CourseTemplatePanel />} />
            <Route path="cost-monitoring" element={<CostMonitoringPanel />} />
            <Route index element={<Navigate to="countries" replace />} />
          </Route>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
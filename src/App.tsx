// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import LandingPage from "./pages/LandingPage"; // You might use this later
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    // 1. Wrap the entire app in the Router component
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import Login from "./components/Login";
import Register from "./components/Register";
import SocietyDashboard from "./components/SocietyDashboard";
import FireStationDashboard from "./components/FireStationDashboard";
import ResidentManagement from "./components/ResidentManagement";
import ProtectedRoute from "./components/ProtectedRoutes";
import Fire from "./components/Fire"

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/society/dashboard" 
              element={
                <ProtectedRoute>
                  <SocietyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/society/residents" 
              element={
                <ProtectedRoute>
                  <ResidentManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/fire-station/dashboard" 
              element={
                <ProtectedRoute>
                  <FireStationDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Fire/>}/>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */

import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import StudentProfile from './components/StudentProfile';
import FacultyProfile from './components/FacultyProfile';
import Report from './components/Report';
import MyProfile from './components/MyProfile';
import Unauthorized from './components/Unauthorized';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route element={<Sidebar />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/students" element={<StudentProfile />} />
                    <Route path="/faculty" element={<FacultyProfile />} />
                    <Route path="/reports" element={<Report />} />
                    <Route path="/profile" element={<MyProfile />} />
                </Route>
            </Routes>
        </Router>
    );
}

const appElement = document.getElementById('app');
if (appElement) {
    const root = createRoot(appElement);
    root.render(<App />);
}
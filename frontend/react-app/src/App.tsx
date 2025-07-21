import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DocumentPage from './pages/DocumentPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/document/:sessionName" element={<DocumentPage />} />
      </Routes>
    </Router>
  );
}

export default App;

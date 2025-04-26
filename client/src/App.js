import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.js';
import Customers from './pages/Customers.js';
import Upload from './pages/Upload.js';
import Navbar from './components/Navbar.js'; // A simple Navbar for navigation

const App = () => {
  return (
    <Router>
      <div>
        {/* Navbar can be displayed on every page */}
        <Navbar />

        
        {/* Routes to switch between different pages */}

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

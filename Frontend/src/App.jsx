/**
 * PayPilot - Main Application Component
 * 
 * PayPilot intervenes BEFORE risky financial decisions.
 * 
 * Routes:
 * - / : Landing Page (Initial Setup)
 * - /simulate : Payment Simulator (Core Demo)
 * - /history : Override History (Behavioral Memory)
 * - /profile : User Profile (Financial Mirror)
 * 
 * This frontend demonstrates:
 * - Continuous risk adaptation based on evolving financial context
 * - User behavior tracking and trust scoring
 * - Full user autonomy with override capabilities
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

// Pages
import LandingPage from './pages/LandingPage';
import SimulatorPage from './pages/SimulatorPage';
import HistoryPage from './pages/HistoryPage';
import UserProfilePage from './pages/UserProfilePage';

// Global styles
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Landing Page - Initial User Setup */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Payment Simulator - Core Intervention Demo */}
            <Route path="/simulate" element={<SimulatorPage />} />
            
            {/* History Page - Behavioral Memory */}
            <Route path="/history" element={<HistoryPage />} />
            
            {/* User Profile - Financial Mirror */}
            <Route path="/profile" element={<UserProfilePage />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;

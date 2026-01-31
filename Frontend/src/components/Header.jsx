/**
 * Header Component - Shared navigation for PayPilot
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldIcon, UserIcon, PaymentIcon, HistoryIcon } from './Icons';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header__container">
        <button className="header__logo" onClick={() => navigate('/')}>
          <div className="header__logo-icon">
            <ShieldIcon size={20} />
          </div>
          <span className="header__logo-text">PayPilot</span>
        </button>

        <nav className="header__nav">
          <button
            className={`header__nav-item ${isActive('/simulate') ? 'header__nav-item--active' : ''}`}
            onClick={() => navigate('/simulate')}
          >
            <PaymentIcon size={18} />
            <span>Payment</span>
          </button>
          
          <button
            className={`header__nav-item ${isActive('/history') ? 'header__nav-item--active' : ''}`}
            onClick={() => navigate('/history')}
          >
            <HistoryIcon size={18} />
            <span>History</span>
          </button>

            <button
            className={`header__nav-item ${isActive('/profile') ? 'header__nav-item--active' : ''}`}
            onClick={() => navigate('/profile')}
          >
            <UserIcon size={18} />
            <span>User Profile</span>
          </button>

        </nav>
      </div>
    </header>
  );
}

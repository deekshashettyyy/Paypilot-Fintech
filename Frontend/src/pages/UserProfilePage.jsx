/**
 * UserProfilePage - User Profile with Editable Context
 * 
 * Shows all context used by AI:
 * - Current Balance (editable)
 * - Safe to Spend (calculated)
 * - Upcoming Obligations (editable)
 * - Recent Spending Summary
 * - Trust Score
 * - Override history
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';
import { 
  WalletIcon, 
  HomeIcon, 
  CreditCardIcon, 
  UtensilsIcon, 
  FilmIcon, 
  ZapIcon, 
  ShoppingBagIcon,
  ArrowRightIcon 
} from '../components/Icons';
import './UserProfilePage.css';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const {
    userId,
    financialContext,
    trustScore,
    overrideHistory,
    spendingSummary,
    isSetupComplete,
    updateFinancialContext
  } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [editedContext, setEditedContext] = useState({
    balance: financialContext.balance,
    rentAmount: financialContext.rentAmount,
    monthlyEMIs: financialContext.monthlyEMIs,
    daysToRent: financialContext.daysToRent || 15
  });
  const [saveMessage, setSaveMessage] = useState('');

  // Redirect to landing if not setup
  useEffect(() => {
    if (!isSetupComplete) {
      navigate('/');
    }
  }, [isSetupComplete, navigate]);

  // Sync edited context when financial context changes
  useEffect(() => {
    setEditedContext({
      balance: financialContext.balance,
      rentAmount: financialContext.rentAmount,
      monthlyEMIs: financialContext.monthlyEMIs,
      daysToRent: financialContext.daysToRent || 15
    });
  }, [financialContext]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedContext(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSaveContext = () => {
    // Update context (automatically persists to localStorage)
    updateFinancialContext(editedContext);
    setIsEditing(false);
    setSaveMessage('Profile updated successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleCancelEdit = () => {
    setEditedContext({
      balance: financialContext.balance,
      rentAmount: financialContext.rentAmount,
      monthlyEMIs: financialContext.monthlyEMIs,
      daysToRent: financialContext.daysToRent || 15
    });
    setIsEditing(false);
  };

  // Calculate safe to spend
  const safeToSpend = Math.max(0, financialContext.balance - financialContext.rentAmount - financialContext.monthlyEMIs);

  // Get last override date
  const lastOverrideDate = overrideHistory.length > 0 
    ? new Date(overrideHistory[0].date).toLocaleDateString()
    : 'Never';

  if (!isSetupComplete) {
    return null;
  }

  return (
    <div className="profile-page">
      <Header />
      
      <main className="profile-main">
        <div className="profile-container">
          {/* Page Title */}
          <div className="profile-header">
            <h1>User Profile</h1>
            <p>This is the context the AI uses to make decisions</p>
            <div className="profile-user-id">User: <strong>{userId}</strong></div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className="save-message">
              {saveMessage}
            </div>
          )}

          {/* Balance Card */}
          <div className="balance-card">
            <div className="balance-card__main">
              <div className="balance-card__icon icon-box icon-box--lg icon-box--primary">
                <WalletIcon size={24} />
              </div>
              <div className="balance-card__info">
                <span className="balance-card__label">Current Balance</span>
                {isEditing ? (
                  <input
                    type="number"
                    name="balance"
                    value={editedContext.balance}
                    onChange={handleEditChange}
                    className="balance-card__input"
                    min="0"
                    step="0.01"
                  />
                ) : (
                  <span className="balance-card__value">
                    ₹{financialContext.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="balance-card__edit">
                  Edit
                </button>
              ) : (
                <div className="balance-card__actions">
                  <button onClick={handleSaveContext} className="btn-save">Save</button>
                  <button onClick={handleCancelEdit} className="btn-cancel">Cancel</button>
                </div>
              )}
            </div>
            
            <div className="balance-card__safe">
              <span className="safe-label">Safe to Spend</span>
              <span className="safe-value">
                ₹{safeToSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="safe-note">After upcoming obligations</span>
            </div>
          </div>

          {/* Upcoming Obligations */}
          <div className="section-card">
            <h2 className="section-title">Upcoming Obligations</h2>
            <div className="obligations-grid">
              <div className="obligation-item">
                <div className="obligation-icon icon-box icon-box--md" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <HomeIcon size={20} />
                </div>
                <div className="obligation-info">
                  <span className="obligation-label">Rent Due</span>
                  {isEditing ? (
                    <input
                      type="number"
                      name="rentAmount"
                      value={editedContext.rentAmount}
                      onChange={handleEditChange}
                      className="obligation-input"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <span className="obligation-value">
                      ₹{financialContext.rentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  {isEditing && (
                    <div className="obligation-days">
                      <label>Days until due:</label>
                      <input
                        type="number"
                        name="daysToRent"
                        value={editedContext.daysToRent}
                        onChange={handleEditChange}
                        className="days-input"
                        min="0"
                        max="31"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="obligation-item">
                <div className="obligation-icon icon-box icon-box--md" style={{ background: '#fee2e2', color: '#ef4444' }}>
                  <CreditCardIcon size={20} />
                </div>
                <div className="obligation-info">
                  <span className="obligation-label">EMI Payment</span>
                  {isEditing ? (
                    <input
                      type="number"
                      name="monthlyEMIs"
                      value={editedContext.monthlyEMIs}
                      onChange={handleEditChange}
                      className="obligation-input"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <span className="obligation-value">
                      ₹{financialContext.monthlyEMIs.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trust & Override Info */}
          <div className="section-card">
            <h2 className="section-title">Trust Status</h2>
            <div className="trust-grid">
              <div className="trust-item">
                <span className="trust-label">Trust Score</span>
                <span className={`trust-value ${trustScore >= 70 ? 'trust-high' : trustScore >= 40 ? 'trust-medium' : 'trust-low'}`}>
                  {trustScore}
                </span>
              </div>
              <div className="trust-item">
                <span className="trust-label">Total Overrides</span>
                <span className="trust-value">{overrideHistory.length}</span>
              </div>
              <div className="trust-item">
                <span className="trust-label">Last Override</span>
                <span className="trust-value trust-date">{lastOverrideDate}</span>
              </div>
            </div>
          </div>

          {/* Recent Spending Summary */}
          <div className="section-card">
            <h2 className="section-title">Recent Spending Summary</h2>
            <div className="spending-grid">
              <div className="spending-item">
                <div className="spending-icon icon-box icon-box--md" style={{ background: '#d1fae5', color: '#10b981' }}>
                  <UtensilsIcon size={20} />
                </div>
                <div className="spending-info">
                  <span className="spending-label">Food</span>
                  <span className="spending-value">
                    ₹{(spendingSummary.food || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="spending-item">
                <div className="spending-icon icon-box icon-box--md" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                  <FilmIcon size={20} />
                </div>
                <div className="spending-info">
                  <span className="spending-label">Entertainment</span>
                  <span className="spending-value">
                    ₹{(spendingSummary.entertainment || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="spending-item">
                <div className="spending-icon icon-box icon-box--md" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                  <ZapIcon size={20} />
                </div>
                <div className="spending-info">
                  <span className="spending-label">Utilities</span>
                  <span className="spending-value">
                    ₹{(spendingSummary.utilities || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="spending-item">
                <div className="spending-icon icon-box icon-box--md" style={{ background: '#fce7f3', color: '#ec4899' }}>
                  <ShoppingBagIcon size={20} />
                </div>
                <div className="spending-info">
                  <span className="spending-label">Shopping</span>
                  <span className="spending-value">
                    ₹{(spendingSummary.shopping || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="profile-cta">
            <button className="btn btn-primary profile-btn" onClick={() => navigate('/simulate')}>
              Continue to Payment
              <ArrowRightIcon size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

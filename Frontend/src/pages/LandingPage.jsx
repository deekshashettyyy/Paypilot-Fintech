/**
 * LandingPage - User Context Setup Form
 * 
 * Collects initial user data:
 * - userId
 * - Current balance
 * - Rent due
 * - EMI amount
 * - Initial spending categories
 * 
 * On submit:
 * - Saves to context with localStorage persistence
 * - Redirects to Profile page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ShieldIcon, BrainIcon, TrendDownIcon, AlertTriangleIcon } from '../components/Icons';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { completeSetup, isSetupComplete } = useUser();
  
  const [formData, setFormData] = useState({
    userId: '',
    balance: '',
    rentAmount: '',
    monthlyEMIs: '',
    daysToRent: '15',
    foodSpending: '',
    shoppingSpending: '',
    utilitiesSpending: '',
    entertainmentSpending: ''
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.userId.trim()) {
      setError('Please enter a User ID');
      return false;
    }
    if (!formData.balance || parseFloat(formData.balance) < 0) {
      setError('Please enter a valid balance');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare user data
      const userData = {
        userId: formData.userId.trim(),
        balance: parseFloat(formData.balance) || 0,
        rentAmount: parseFloat(formData.rentAmount) || 0,
        monthlyEMIs: parseFloat(formData.monthlyEMIs) || 0,
        daysToRent: parseInt(formData.daysToRent) || 15,
        spending: {
          food: parseFloat(formData.foodSpending) || 0,
          shopping: parseFloat(formData.shoppingSpending) || 0,
          utilities: parseFloat(formData.utilitiesSpending) || 0,
          entertainment: parseFloat(formData.entertainmentSpending) || 0
        }
      };

      // Save to context (persists to localStorage)
      completeSetup(userData);
      
      // Navigate to profile
      navigate('/profile');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already set up, show option to continue or reset
  if (isSetupComplete) {
    return (
      <div className="landing">
        <div className="landing__content">
          <div className="landing__hero">
            <div className="landing__logo">
              <ShieldIcon size={32} />
            </div>
            <h1 className="landing__title">PayPilot</h1>
            <p className="landing__tagline">AI that thinks before you spend</p>
          </div>

          <div className="landing__features">
            <div className="feature-card">
              <div className="feature-card__icon icon-box icon-box--md icon-box--primary">
                <BrainIcon size={20} />
              </div>
              <h3 className="feature-card__title">AI-Powered Analysis</h3>
              <p className="feature-card__description">
                Every transaction is analyzed against your financial context
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon icon-box icon-box--md icon-box--primary">
                <TrendDownIcon size={20} />
              </div>
              <h3 className="feature-card__title">Prevent Overspending</h3>
              <p className="feature-card__description">
                Get warnings before you exceed safe spending limits
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon icon-box icon-box--md icon-box--primary">
                <AlertTriangleIcon size={20} />
              </div>
              <h3 className="feature-card__title">Emergency Override</h3>
              <p className="feature-card__description">
                Always maintain control with documented override options
              </p>
            </div>
          </div>

          <div className="landing__cta">
            <button className="btn btn-primary landing__btn" onClick={() => navigate('/profile')}>
              Continue to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing">
      <div className="landing__content landing__content--form">
        {/* Hero */}
        <div className="landing__hero landing__hero--compact">
          <div className="landing__logo">
            <ShieldIcon size={32} />
          </div>
          <h1 className="landing__title">PayPilot</h1>
          <p className="landing__tagline">AI that thinks before you spend</p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="setup-form">
          <div className="setup-form__card">
            <h2 className="setup-form__title">Set Up Your Profile</h2>
            <p className="setup-form__subtitle">
              Enter your financial context so AI can make informed decisions
            </p>

            {/* User ID */}
            <div className="form-group">
              <label className="form-label" htmlFor="userId">User ID</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                placeholder="e.g., john_doe"
                className="form-input"
                required
              />
            </div>

            {/* Balance */}
            <div className="form-group">
              <label className="form-label" htmlFor="balance">Current Balance ($)</label>
              <input
                type="number"
                id="balance"
                name="balance"
                value={formData.balance}
                onChange={handleInputChange}
                placeholder="2500"
                min="0"
                step="0.01"
                className="form-input"
                required
              />
            </div>

            {/* Rent and EMI Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="rentAmount">Rent Due ($)</label>
                <input
                  type="number"
                  id="rentAmount"
                  name="rentAmount"
                  value={formData.rentAmount}
                  onChange={handleInputChange}
                  placeholder="1200"
                  min="0"
                  step="0.01"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="monthlyEMIs">EMI Amount ($)</label>
                <input
                  type="number"
                  id="monthlyEMIs"
                  name="monthlyEMIs"
                  value={formData.monthlyEMIs}
                  onChange={handleInputChange}
                  placeholder="350"
                  min="0"
                  step="0.01"
                  className="form-input"
                />
              </div>
            </div>

            {/* Days to Rent */}
            <div className="form-group">
              <label className="form-label" htmlFor="daysToRent">Days Until Rent Due</label>
              <input
                type="number"
                id="daysToRent"
                name="daysToRent"
                value={formData.daysToRent}
                onChange={handleInputChange}
                placeholder="15"
                min="0"
                max="31"
                className="form-input"
              />
            </div>

            {/* Spending Summary Section */}
            <div className="form-section">
              <h3 className="form-section__title">Recent Spending (Optional)</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="foodSpending">Food ($)</label>
                  <input
                    type="number"
                    id="foodSpending"
                    name="foodSpending"
                    value={formData.foodSpending}
                    onChange={handleInputChange}
                    placeholder="320"
                    min="0"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="shoppingSpending">Shopping ($)</label>
                  <input
                    type="number"
                    id="shoppingSpending"
                    name="shoppingSpending"
                    value={formData.shoppingSpending}
                    onChange={handleInputChange}
                    placeholder="245"
                    min="0"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="utilitiesSpending">Utilities ($)</label>
                  <input
                    type="number"
                    id="utilitiesSpending"
                    name="utilitiesSpending"
                    value={formData.utilitiesSpending}
                    onChange={handleInputChange}
                    placeholder="95"
                    min="0"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="entertainmentSpending">Entertainment ($)</label>
                  <input
                    type="number"
                    id="entertainmentSpending"
                    name="entertainmentSpending"
                    value={formData.entertainmentSpending}
                    onChange={handleInputChange}
                    placeholder="180"
                    min="0"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            {/* Submit */}
            <button 
              type="submit" 
              className="btn btn-primary setup-form__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Setting up...' : 'Start Using PayPilot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

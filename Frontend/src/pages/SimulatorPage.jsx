/**
 * SimulatorPage - Make a Payment
 * 
 * Sends payment request to backend with full user context:
 * - userId
 * - amount
 * - category
 * - balance
 * - daysToRent
 * 
 * Handles backend response:
 * - decision (ALLOW / WARN / BLOCK)
 * - riskScore
 * - reasons
 * - explanation (from Gemini)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { evaluateRisk, recordOverride } from '../api/riskApi';
import Header from '../components/Header';
import DecisionCard from '../components/DecisionCard';
import { ShieldIcon, BrainIcon } from '../components/Icons';
import './SimulatorPage.css';

export default function SimulatorPage() {
  const navigate = useNavigate();
  const {
    userId,
    financialContext,
    isSetupComplete,
    deductFromBalance,
    addTransaction,
    addOverride
  } = useUser();

  // Redirect to landing if not setup
  useEffect(() => {
    if (!isSetupComplete) {
      navigate('/');
    }
  }, [isSetupComplete, navigate]);

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('shopping');

  // Evaluation result
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [overrideSuccess, setOverrideSuccess] = useState(false);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setError('');
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parsedAmount > financialContext.balance) {
      setError('Amount exceeds your current balance');
      return;
    }

    setIsEvaluating(true);
    setEvaluation(null);
    setError('');
    setOverrideSuccess(false);

    try {
      // Send request to backend with correct payload
      const result = await evaluateRisk({
        userId,
        amount: parsedAmount,
        category,
        balance: financialContext.balance,
        daysToRent: financialContext.daysToRent || 15
      });

      // Check for error response
      if (result.error) {
        setError(result.message);
        setIsEvaluating(false);
        return;
      }

      const evaluationResult = {
        ...result,
        amount: parsedAmount,
        category
      };

      setEvaluation(evaluationResult);

      // If ALLOW, automatically deduct from balance and record transaction
      if (result.decision === 'ALLOW') {
        deductFromBalance(parsedAmount, category);
        addTransaction({
          amount: parsedAmount,
          category,
          decision: 'ALLOW',
          riskScore: result.riskScore,
          explanation: result.explanation
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to evaluate transaction. Please ensure the backend is running.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleOverride = async () => {
    if (!evaluation) return;

    try {
      // Record override with backend
      await recordOverride({
        userId,
        riskScore: evaluation.riskScore,
        decision: evaluation.decision
      });

      // Deduct from balance since user proceeded
      deductFromBalance(evaluation.amount, category);

      // Add to transaction history
      addTransaction({
        amount: evaluation.amount,
        category,
        decision: evaluation.decision,
        riskScore: evaluation.riskScore,
        explanation: evaluation.explanation,
        overridden: true
      });

      // Add to override history
      addOverride({
        riskScore: evaluation.riskScore,
        decision: evaluation.decision,
        amount: evaluation.amount,
        category
      });

      setOverrideSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to record override');
    }
  };

  const resetPayment = () => {
    setAmount('');
    setCategory('shopping');
    setEvaluation(null);
    setError('');
    setOverrideSuccess(false);
  };

  if (!isSetupComplete) {
    return null;
  }

  // Show decision result
  if (evaluation || isEvaluating) {
    return (
      <div className="simulator-page">
        <Header />
        <main className="simulator-main">
          <div className="simulator-container">
            {overrideSuccess ? (
              <div className="override-success-card animate-fade-in">
                <div className="override-success__icon">
                  <ShieldIcon size={32} />
                </div>
                <h2>Override Recorded</h2>
                <p>This will affect your future trust score</p>
                <button className="btn btn-primary" onClick={resetPayment}>
                  Make Another Payment
                </button>
              </div>
            ) : (
              <DecisionCard
                riskScore={evaluation?.riskScore}
                decision={evaluation?.decision}
                factors={evaluation?.reasons || []}
                explanation={evaluation?.explanation}
                amount={evaluation?.amount}
                onOverride={
                  (evaluation?.decision === 'WARN' || evaluation?.decision === 'BLOCK')
                    ? handleOverride
                    : null
                }
                onReset={resetPayment}
                isLoading={isEvaluating}
              />
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="simulator-page">
      <Header />
      
      <main className="simulator-main">
        <div className="simulator-container">
          {/* Payment Icon */}
          <div className="payment-icon">
            <ShieldIcon size={32} />
          </div>

          {/* Title */}
          <h1 className="payment-title">Make a Payment</h1>
          <p className="payment-subtitle">Enter the amount you want to spend</p>

          {/* Payment Form */}
          <form onSubmit={handleEvaluate} className="payment-form">
            <div className="payment-card">
              {/* Amount Input */}
              <div className="amount-group">
                <label className="amount-label">Amount</label>
                <div className="amount-input-wrapper">
                  <span className="amount-currency">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="amount-input"
                    min="0"
                    step="0.01"
                    disabled={isEvaluating}
                  />
                </div>
              </div>

              {/* Category Select */}
              <div className="category-group">
                <label className="category-label">Category</label>
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="category-select"
                  disabled={isEvaluating}
                >
                  <option value="shopping">Shopping</option>
                  <option value="food">Food & Dining</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="utilities">Utilities</option>
                </select>
              </div>

              {/* AI Check Note */}
              <div className="ai-note">
                <BrainIcon size={18} />
                <span>This payment will be checked by AI before processing</span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="payment-error">
                  {error}
                </div>
              )}

              {/* Pay Button */}
              <button
                type="submit"
                className="pay-button"
                disabled={isEvaluating || !amount}
              >
                {isEvaluating ? 'Processing...' : 'Pay'}
              </button>
            </div>
          </form>

          {/* Context Summary */}
          <div className="context-summary">
            <div className="context-item">
              <span className="context-label">Balance</span>
              <span className="context-value">₹{financialContext.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="context-item">
              <span className="context-label">Rent Due</span>
              <span className="context-value">₹{financialContext.rentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="context-item">
              <span className="context-label">Days to Rent</span>
              <span className="context-value">{financialContext.daysToRent || 15}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

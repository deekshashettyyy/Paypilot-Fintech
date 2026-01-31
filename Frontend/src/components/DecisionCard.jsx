/**
 * DecisionCard - Payment Decision Result
 * 
 * Displays backend decision:
 * - ALLOW: Green success state
 * - WARN: Amber warning with override option
 * - BLOCK: Red blocked with override option
 * 
 * Shows:
 * - Decision status
 * - Risk score
 * - Reasons (from backend)
 * - Gemini explanation (if present)
 */

import { useState } from 'react';
import { CheckCircleIcon, AlertTriangleIcon, XCircleIcon, CheckIcon, ArrowRightIcon } from './Icons';
import './DecisionCard.css';

export default function DecisionCard({
  riskScore,
  decision,
  factors = [],
  explanation,
  amount,
  onOverride,
  onReset,
  isLoading = false
}) {
  const [isOverriding, setIsOverriding] = useState(false);

  const handleOverride = async () => {
    setIsOverriding(true);
    try {
      await onOverride();
    } finally {
      setIsOverriding(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="decision-card decision-card--loading">
        <div className="decision-card__loader">
          <div className="spinner"></div>
          <p>Analyzing your payment...</p>
        </div>
      </div>
    );
  }

  // ALLOW State - Payment Approved
  if (decision === 'ALLOW') {
    return (
      <div className="decision-card decision-card--allow animate-fade-in">
        <div className="decision-card__icon-wrapper decision-card__icon-wrapper--allow">
          <CheckIcon size={40} />
        </div>
        
        <h2 className="decision-card__title decision-card__title--allow">Payment Approved</h2>
        <p className="decision-card__amount">${amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        
        {/* Risk Score */}
        {riskScore !== undefined && (
          <div className="decision-card__risk-score decision-card__risk-score--low">
            Risk Score: {riskScore}
          </div>
        )}

        {/* Explanation from Gemini */}
        {explanation && (
          <div className="decision-card__message decision-card__message--allow">
            <CheckCircleIcon size={18} />
            <span>{explanation}</span>
          </div>
        )}

        {/* Reasons from backend */}
        {factors.length > 0 && (
          <div className="decision-card__factors decision-card__factors--success">
            {factors.map((factor, index) => (
              <div key={index} className="decision-card__factor">{factor}</div>
            ))}
          </div>
        )}

        <button className="btn btn-success decision-card__btn" onClick={onReset}>
          Make Another Payment
          <ArrowRightIcon size={18} />
        </button>
      </div>
    );
  }

  // WARN State - Payment Warning
  if (decision === 'WARN') {
    return (
      <div className="decision-card decision-card--warn animate-fade-in">
        <div className="decision-card__icon-wrapper decision-card__icon-wrapper--warn">
          <AlertTriangleIcon size={40} />
        </div>
        
        <h2 className="decision-card__title decision-card__title--warn">Payment Warning</h2>
        <p className="decision-card__amount">${amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        
        {/* Risk Score */}
        {riskScore !== undefined && (
          <div className="decision-card__risk-score decision-card__risk-score--medium">
            Risk Score: {riskScore}
          </div>
        )}

        {/* Explanation from Gemini */}
        {explanation && (
          <div className="decision-card__message decision-card__message--warn">
            <AlertTriangleIcon size={18} />
            <span>{explanation}</span>
          </div>
        )}

        {/* Reasons from backend */}
        {factors.length > 0 && (
          <div className="decision-card__factors">
            <div className="decision-card__factors-title">Risk Factors:</div>
            {factors.map((factor, index) => (
              <div key={index} className="decision-card__factor">{factor}</div>
            ))}
          </div>
        )}

        <div className="decision-card__actions">
          {onOverride && (
            <button 
              className="btn btn-warning decision-card__btn" 
              onClick={handleOverride}
              disabled={isOverriding}
            >
              {isOverriding ? 'Processing...' : 'Override & Continue'}
            </button>
          )}
          <button className="btn btn-secondary decision-card__btn" onClick={onReset}>
            Cancel
          </button>
        </div>

        <p className="decision-card__warning-note">
          Override will be recorded and may affect your trust score
        </p>
      </div>
    );
  }

  // BLOCK State - Payment Blocked
  if (decision === 'BLOCK') {
    return (
      <div className="decision-card decision-card--block animate-fade-in">
        <div className="decision-card__icon-wrapper decision-card__icon-wrapper--block">
          <XCircleIcon size={40} />
        </div>
        
        <h2 className="decision-card__title decision-card__title--block">Payment Blocked</h2>
        <p className="decision-card__amount">${amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        
        {/* Risk Score */}
        {riskScore !== undefined && (
          <div className="decision-card__risk-score decision-card__risk-score--high">
            Risk Score: {riskScore}
          </div>
        )}

        {/* Explanation from Gemini */}
        {explanation && (
          <div className="decision-card__message decision-card__message--block">
            <XCircleIcon size={18} />
            <span>{explanation}</span>
          </div>
        )}

        {/* Reasons from backend */}
        {factors.length > 0 && (
          <div className="decision-card__factors">
            <div className="decision-card__factors-title">Risk Factors:</div>
            {factors.map((factor, index) => (
              <div key={index} className="decision-card__factor">{factor}</div>
            ))}
          </div>
        )}

        <div className="decision-card__actions">
          {onOverride && (
            <button 
              className="btn btn-danger decision-card__btn" 
              onClick={handleOverride}
              disabled={isOverriding}
            >
              {isOverriding ? 'Processing...' : 'Override Anyway'}
            </button>
          )}
          <button className="btn btn-secondary decision-card__btn" onClick={onReset}>
            Go Back
          </button>
        </div>

        <p className="decision-card__warning-note">
          Warning: This override will significantly impact your trust score
        </p>
      </div>
    );
  }

  // Default/Unknown state
  return (
    <div className="decision-card">
      <p>Processing...</p>
    </div>
  );
}

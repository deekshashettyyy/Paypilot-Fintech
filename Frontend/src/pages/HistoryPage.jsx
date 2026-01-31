/**
 * HistoryPage - Transaction History
 * 
 * Shows real transaction data from context:
 * - Transaction list with decisions
 * - Filter by decision type
 * - Summary stats (total spent, blocks, warnings)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';
import { HistoryIcon, CheckCircleIcon, XCircleIcon, AlertTriangleIcon } from '../components/Icons';
import './HistoryPage.css';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { isSetupComplete, transactionHistory, overrideHistory } = useUser();
  const [filter, setFilter] = useState('all');

  // Redirect to landing if not setup
  if (!isSetupComplete) {
    navigate('/');
    return null;
  }

  // Get filtered transactions
  const filteredTransactions = transactionHistory.filter(t => {
    if (filter === 'all') return true;
    return t.decision === filter;
  });

  // Calculate stats
  const stats = {
    total: transactionHistory.reduce((sum, t) => sum + (t.amount || 0), 0),
    allowed: transactionHistory.filter(t => t.decision === 'ALLOW').length,
    warned: transactionHistory.filter(t => t.decision === 'WARN').length,
    blocked: transactionHistory.filter(t => t.decision === 'BLOCK').length,
    overrides: overrideHistory.length
  };

  // Get decision icon
  const getDecisionIcon = (decision) => {
    switch (decision) {
      case 'ALLOW':
        return <CheckCircleIcon size={20} />;
      case 'BLOCK':
        return <XCircleIcon size={20} />;
      case 'WARN':
        return <AlertTriangleIcon size={20} />;
      default:
        return null;
    }
  };

  // Get decision badge class
  const getDecisionClass = (decision) => {
    switch (decision) {
      case 'ALLOW':
        return 'decision-allow';
      case 'BLOCK':
        return 'decision-block';
      case 'WARN':
        return 'decision-warn';
      default:
        return '';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="history-page">
      <Header />
      
      <main className="history-main">
        <div className="history-container">
          {/* Header Icon */}
          <div className="history-icon">
            <HistoryIcon size={32} />
          </div>

          {/* Title */}
          <h1 className="history-title">Transaction History</h1>
          <p className="history-subtitle">Review your past payment decisions</p>

          {/* Summary Stats */}
          <div className="history-stats">
            <div className="stat-item">
              <span className="stat-value">${stats.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className="stat-label">Total Spent</span>
            </div>
            <div className="stat-item">
              <span className="stat-value stat-value--success">{stats.allowed}</span>
              <span className="stat-label">Allowed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value stat-value--warning">{stats.warned}</span>
              <span className="stat-label">Warnings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value stat-value--danger">{stats.blocked}</span>
              <span className="stat-label">Blocked</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({transactionHistory.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'ALLOW' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter('ALLOW')}
            >
              Allowed
            </button>
            <button 
              className={`filter-tab ${filter === 'WARN' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter('WARN')}
            >
              Warned
            </button>
            <button 
              className={`filter-tab ${filter === 'BLOCK' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter('BLOCK')}
            >
              Blocked
            </button>
          </div>

          {/* Transaction List */}
          <div className="transaction-list">
            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                {transactionHistory.length === 0 ? (
                  <>
                    <p>No transactions yet</p>
                    <button className="btn btn-primary" onClick={() => navigate('/simulate')}>
                      Make Your First Payment
                    </button>
                  </>
                ) : (
                  <p>No transactions match this filter</p>
                )}
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className={`transaction-item ${getDecisionClass(transaction.decision)}`}>
                  <div className="transaction-item__left">
                    <div className={`transaction-item__icon ${getDecisionClass(transaction.decision)}`}>
                      {getDecisionIcon(transaction.decision)}
                    </div>
                    <div className="transaction-item__info">
                      <span className="transaction-item__amount">
                        ${transaction.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="transaction-item__date">
                        {formatDate(transaction.date)}
                      </span>
                      {transaction.explanation && (
                        <span className="transaction-item__reason">
                          {transaction.explanation}
                        </span>
                      )}
                      {transaction.overridden && (
                        <span className="transaction-item__overridden">
                          Overridden by user
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="transaction-item__right">
                    <span className={`transaction-badge ${getDecisionClass(transaction.decision)}`}>
                      {transaction.decision === 'ALLOW' ? 'Allowed' : 
                       transaction.decision === 'BLOCK' ? 'Blocked' : 'Warned'}
                    </span>
                    {transaction.category && (
                      <span className="transaction-item__category">
                        {transaction.category}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Override Summary */}
          {overrideHistory.length > 0 && (
            <div className="override-summary">
              <h3>Override History</h3>
              <p>You have overridden {overrideHistory.length} decision(s). This affects your trust score.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * UserContext - Central state management for PayPilot
 * 
 * Manages:
 * - User identity (userId) with localStorage persistence
 * - Financial context (balance, rent, EMIs)
 * - Trust score (from backend)
 * - Override history
 * - Transaction history
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const UserContext = createContext(null);

// LocalStorage keys
const STORAGE_KEYS = {
  USER_ID: 'paypilot_userId',
  FINANCIAL_CONTEXT: 'paypilot_financialContext',
  SPENDING_SUMMARY: 'paypilot_spendingSummary',
  TRANSACTION_HISTORY: 'paypilot_transactionHistory'
};

// Load from localStorage
function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Save to localStorage
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function UserProvider({ children }) {
  // User identification - persisted to localStorage
  const [userId, setUserIdState] = useState(() => 
    loadFromStorage(STORAGE_KEYS.USER_ID, '')
  );
  
  // Financial context - persisted
  const [financialContext, setFinancialContextState] = useState(() => 
    loadFromStorage(STORAGE_KEYS.FINANCIAL_CONTEXT, {
      balance: 0,
      rentAmount: 0,
      monthlyEMIs: 0,
      daysToRent: 15
    })
  );

  // Trust score from backend
  const [trustScore, setTrustScore] = useState(100);

  // Override history from backend
  const [overrideHistory, setOverrideHistory] = useState([]);

  // Spending summary - persisted
  const [spendingSummary, setSpendingSummaryState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SPENDING_SUMMARY, {
      shopping: 0,
      food: 0,
      entertainment: 0,
      utilities: 0
    })
  );

  // Transaction history - persisted locally
  const [transactionHistory, setTransactionHistoryState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TRANSACTION_HISTORY, [])
  );

  // Whether initial setup is complete
  const [isSetupComplete, setIsSetupComplete] = useState(() => {
    const storedUserId = loadFromStorage(STORAGE_KEYS.USER_ID, '');
    return storedUserId !== '';
  });

  // Persist userId
  const setUserId = useCallback((id) => {
    setUserIdState(id);
    saveToStorage(STORAGE_KEYS.USER_ID, id);
  }, []);

  // Update and persist financial context
  const updateFinancialContext = useCallback((updates) => {
    setFinancialContextState(prev => {
      const newContext = { ...prev, ...updates };
      saveToStorage(STORAGE_KEYS.FINANCIAL_CONTEXT, newContext);
      return newContext;
    });
  }, []);

  // Update and persist spending summary
  const updateSpendingSummary = useCallback((category, amount) => {
    setSpendingSummaryState(prev => {
      const newSummary = {
        ...prev,
        [category]: (prev[category] || 0) + amount
      };
      saveToStorage(STORAGE_KEYS.SPENDING_SUMMARY, newSummary);
      return newSummary;
    });
  }, []);

  // Deduct from balance after a transaction goes through
  const deductFromBalance = useCallback((amount, category) => {
    setFinancialContextState(prev => {
      const newContext = {
        ...prev,
        balance: Math.max(0, prev.balance - amount)
      };
      saveToStorage(STORAGE_KEYS.FINANCIAL_CONTEXT, newContext);
      return newContext;
    });
    
    // Update spending summary
    if (category) {
      updateSpendingSummary(category, amount);
    }
  }, [updateSpendingSummary]);

  // Add transaction to history
  const addTransaction = useCallback((transaction) => {
    setTransactionHistoryState(prev => {
      const newHistory = [
        {
          ...transaction,
          id: Date.now(),
          date: new Date().toISOString()
        },
        ...prev
      ].slice(0, 50); // Keep last 50 transactions
      saveToStorage(STORAGE_KEYS.TRANSACTION_HISTORY, newHistory);
      return newHistory;
    });
  }, []);

  // Complete initial setup
  const completeSetup = useCallback((userData) => {
    setUserId(userData.userId);
    
    const newContext = {
      balance: userData.balance || 0,
      rentAmount: userData.rentAmount || 0,
      monthlyEMIs: userData.monthlyEMIs || 0,
      daysToRent: userData.daysToRent || 15
    };
    
    setFinancialContextState(newContext);
    saveToStorage(STORAGE_KEYS.FINANCIAL_CONTEXT, newContext);
    
    // Set initial spending if provided
    if (userData.spending) {
      setSpendingSummaryState(userData.spending);
      saveToStorage(STORAGE_KEYS.SPENDING_SUMMARY, userData.spending);
    }
    
    setIsSetupComplete(true);
  }, [setUserId]);

  // Update from backend response
  const updateFromBackend = useCallback((backendData) => {
    if (backendData.trustScore !== undefined) {
      setTrustScore(backendData.trustScore);
    }
    if (backendData.overrides) {
      setOverrideHistory(backendData.overrides);
    }
  }, []);

  // Add override to history
  const addOverride = useCallback((override) => {
    setOverrideHistory(prev => [
      {
        ...override,
        date: new Date().toISOString()
      },
      ...prev
    ]);
    
    // Decrease trust score locally (backend handles actual calculation)
    setTrustScore(prev => Math.max(0, prev - 5));
  }, []);

  // Reset all data (for logout/restart)
  const resetUserData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.FINANCIAL_CONTEXT);
    localStorage.removeItem(STORAGE_KEYS.SPENDING_SUMMARY);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTION_HISTORY);
    
    setUserIdState('');
    setFinancialContextState({
      balance: 0,
      rentAmount: 0,
      monthlyEMIs: 0,
      daysToRent: 15
    });
    setSpendingSummaryState({
      shopping: 0,
      food: 0,
      entertainment: 0,
      utilities: 0
    });
    setTransactionHistoryState([]);
    setTrustScore(100);
    setOverrideHistory([]);
    setIsSetupComplete(false);
  }, []);

  const value = {
    // State
    userId,
    financialContext,
    trustScore,
    overrideHistory,
    spendingSummary,
    transactionHistory,
    isSetupComplete,
    
    // Actions
    setUserId,
    updateFinancialContext,
    deductFromBalance,
    completeSetup,
    updateFromBackend,
    setTrustScore,
    setOverrideHistory,
    addOverride,
    addTransaction,
    resetUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;

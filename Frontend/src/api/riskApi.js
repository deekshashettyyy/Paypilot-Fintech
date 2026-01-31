/**
 * Risk API - Backend communication for PayPilot
 * 
 * Endpoints:
 * - POST /risk/evaluate - Evaluate transaction risk
 * - POST /risk/override - Record user override decision
 */

import axios from 'axios';

// Backend base URL - configure for your environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout for AI responses
});

/**
 * Evaluate a transaction for risk
 * 
 * Backend expects:
 * - userId
 * - amount
 * - balance
 * - category
 * - daysToRent
 * 
 * Backend adds from user record:
 * - overrideCount
 * - trustScore
 */
export async function evaluateRisk({
  userId,
  amount,
  category,
  balance,
  daysToRent = 15
}) {
  try {
    const response = await api.post('/risk/evaluate', {
      userId,
      amount,
      balance,
      category,
      daysToRent
    });
    
    return response.data;
  } catch (error) {
    console.error('Risk evaluation failed:', error);
    
    // Return error info but don't throw to allow graceful handling
    if (error.response?.data) {
      return {
        error: true,
        message: error.response.data.error || 'Failed to evaluate transaction risk',
        decision: error.response.data.policy?.decision || 'WARN',
        riskScore: 50,
        reasons: ['Unable to complete risk assessment']
      };
    }
    
    throw new Error(
      'Failed to evaluate transaction risk. Please ensure the backend is running.'
    );
  }
}

/**
 * Record a user override decision
 * 
 * When user chooses to proceed despite WARN or BLOCK,
 * this records the override which affects future trust score.
 */
export async function recordOverride({
  userId,
  riskScore,
  decision
}) {
  try {
    const response = await api.post('/risk/override', {
      userId,
      riskScore,
      decision
    });
    
    return response.data;
  } catch (error) {
    console.error('Override recording failed:', error);
    throw new Error(
      error.response?.data?.error || 
      'Failed to record override. Please try again.'
    );
  }
}

/**
 * Get user profile - attempts to fetch user data
 * Since backend doesn't have a dedicated user route,
 * we'll trigger a zero-amount evaluation to get user state
 */
export async function getUserProfile(userId) {
  try {
    // Use a zero-amount evaluation to fetch user state
    const response = await api.post('/risk/evaluate', {
      userId,
      amount: 0,
      balance: 10000,
      category: 'utilities',
      daysToRent: 30
    });
    
    return {
      userId,
      trustScore: 100, // Default, backend doesn't return this yet
      overrides: []
    };
  } catch (error) {
    // If user doesn't exist, return defaults
    return {
      userId,
      trustScore: 100,
      overrides: []
    };
  }
}

export default api;

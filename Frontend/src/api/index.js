/**
 * API Helper - Axios configuration for PayPilot backend
 * 
 * Endpoints:
 * - POST /risk/evaluate - Evaluate transaction risk
 * - POST /risk/override - Record user override
 * 
 * The backend auto-creates users on first request.
 * Financial context is sent with every evaluation request.
 */

import axios from 'axios';

// Backend base URL - update this to match your backend deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for AI responses
});

/**
 * Evaluate transaction risk
 * 
 * @param {Object} data - Evaluation request data
 * @param {string} data.userId - User identifier
 * @param {number} data.amount - Transaction amount
 * @param {string} data.category - Transaction category (shopping|food|entertainment|utilities)
 * @param {number} data.daysUntilRent - Days until next rent payment
 * @param {number} data.currentBalance - User's current bank balance
 * @param {number} data.rentAmount - Monthly rent amount
 * @param {number} data.monthlyEMIs - Monthly EMI/fixed commitments
 * @param {string} data.riskSensitivity - Risk sensitivity level (low|medium|high)
 * 
 * @returns {Promise<Object>} Evaluation result with:
 *   - decision: 'ALLOW' | 'WARN' | 'BLOCK'
 *   - riskScore: 0-100
 *   - factors: Array of risk factor descriptions
 *   - explanation: Gemini-generated explanation (when aiRequired)
 *   - trustScore: Current user trust score
 *   - aiRequired: Whether AI explanation was needed
 */
export async function evaluateRisk(data) {
  try {
    const response = await api.post('/risk/evaluate', {
      userId: data.userId,
      amount: data.amount,
      category: data.category,
      daysUntilRent: data.daysUntilRent,
      currentBalance: data.currentBalance,
      rentAmount: data.rentAmount,
      monthlyEMIs: data.monthlyEMIs,
      riskSensitivity: data.riskSensitivity,
    });
    return response.data;
  } catch (error) {
    console.error('Risk evaluation failed:', error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to evaluate risk. Please check your connection.'
    );
  }
}

/**
 * Record user override
 * 
 * @param {Object} data - Override request data
 * @param {string} data.userId - User identifier
 * @param {number} data.riskScore - The risk score that was overridden
 * @param {string} data.decision - The original decision that was overridden
 * @param {number} data.amount - Transaction amount
 * @param {string} data.category - Transaction category
 * 
 * @returns {Promise<Object>} Override result with:
 *   - success: boolean
 *   - newTrustScore: Updated trust score
 *   - message: Confirmation message
 *   - overrideHistory: Updated override history
 */
export async function recordOverride(data) {
  try {
    const response = await api.post('/risk/override', {
      userId: data.userId,
      riskScore: data.riskScore,
      decision: data.decision,
      amount: data.amount,
      category: data.category,
    });
    return response.data;
  } catch (error) {
    console.error('Override recording failed:', error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to record override. Please try again.'
    );
  }
}

/**
 * Get user profile (trust score and override history)
 * 
 * @param {string} userId - User identifier
 * 
 * @returns {Promise<Object>} User profile with:
 *   - trustScore: Current trust score
 *   - overrides: Array of override records
 */
export async function getUserProfile(userId) {
  try {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    // Return default values if user not found
    if (error.response?.status === 404) {
      return {
        trustScore: 100,
        overrides: [],
      };
    }
    throw new Error(
      error.response?.data?.message || 
      'Failed to fetch profile. Please try again.'
    );
  }
}

export default api;

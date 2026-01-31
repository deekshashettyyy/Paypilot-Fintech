import { clamp } from "../utils/clamp.js";

export const calculateRisk = ({
  amount,
  balance,
  category,
  overrideCount,
  trustScore,
  daysToRent
}) => {
  let score = 0;
  const reasons = [];

  if (amount > 0.3 * balance) {
    score += 25;
    reasons.push("High spend compared to balance");
  }

  if (category === "shopping") {
    score += 15;
    reasons.push("Discretionary spending category");
  }

  if (daysToRent <= 7) {
    score += 30;
    reasons.push("Payment close to rent due date");
  }

  if (overrideCount > 1) {
    score += 20;
    reasons.push("Multiple recent overrides");
  }

  // Trust adjustment
  if (trustScore < 50) {
    score += 10;
    reasons.push("Low trust due to past overrides");
  }

  if (trustScore > 80) {
    score -= 5;
    reasons.push("High trust due to responsible past behavior");
  }


  score = clamp(score, 0, 100);

  let decision = "ALLOW";
  if (score >= 70) decision = "BLOCK";
  else if (score >= 40) decision = "WARN";

  return { riskScore: score, decision, reasons };
};

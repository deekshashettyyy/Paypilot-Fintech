export const applyTrustRecovery = (user) => {
  if (!user || !user.lastOverrideAt) return user;

  const now = new Date();
  const daysSinceOverride =
    (now - user.lastOverrideAt) / (1000 * 60 * 60 * 24);

  // If no overrides in last 30 days → recover trust
  if (daysSinceOverride >= 30 && user.trustScore < 100) {
    user.trustScore = Math.min(user.trustScore + 10, 100);
    user.lastOverrideAt = null; // reset cycle
  }

  return user;
};

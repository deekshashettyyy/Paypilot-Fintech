import User from "../models/models.user.js";

export const recordOverride = async (userId, riskScore, decision) => {
  let user = await User.findOne({ userId });

  if (!user) {
    user = await User.create({ userId });
  }

  user.overrides.push({
    riskScore,
    decision
  });

  user.lastOverrideAt = new Date();

  // trust decay on override
  user.trustScore = Math.max(user.trustScore - 5, 0);

  await user.save();

  return user;
};




// override and trust score for each user save in DB
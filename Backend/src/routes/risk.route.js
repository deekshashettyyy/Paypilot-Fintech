import express from "express";
import { calculateRisk } from "../services/riskEngine.service.js";
import { evaluatePolicy } from "../services/policyEngine.service.js";
import User from "../models/models.user.js";
import { recordOverride } from "../services/override.service.js";
import { applyTrustRecovery } from "../services/trust.service.js";
import { generateExplanation } from "../services/aiExplain.service.js";


const router = express.Router();

router.post("/evaluate", async (req, res) => {
  try {

    const { userId } = req.body;   
    const user = await User.findOne({ userId });

    // apply recovery if eligible
    if (user) {
      applyTrustRecovery(user);
      await user.save();
    }

    const overrideCount = user ? user.overrides.length : 0;
    const trustScore = user ? user.trustScore : 100;


    // 1. Calculate risk
    const riskResult = calculateRisk(
      {
        ...req.body,
        overrideCount,
        trustScore
      });;

    // 2. Ask policy engine (n8n)
    const policy = await evaluatePolicy(riskResult.riskScore);

    let explanation = null;
    
    // 3. Gemini
    if (policy.aiRequired) {
      try {
        explanation = await generateExplanation({
          riskScore: riskResult.riskScore,
          reasons: riskResult.reasons,
          trustScore: user ? user.trustScore : 100,
          overrideCount,
          decision: policy.decision
        });
      } catch (err) {
        console.error("Gemini error:", err.message);
        explanation = "This transaction carries financial risk based on your recent activity.";
      }
    }


    // 4. Final response
    res.json({
      riskScore: riskResult.riskScore,
      reasons: riskResult.reasons,
      decision: policy.decision,
      message: policy.message,
      aiRequired: policy.aiRequired,
      explanation
    });


  } catch (err) {
    res.status(500).json(
      {
        error: err.message,
        policy :{
        decision: "WARN",
        message: "Policy engine unavailable",
        aiRequired: false
        }
      }
    );
  }
});


router.post("/override", async (req, res) => {
  try {
    const { userId, riskScore, decision } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await recordOverride(userId, riskScore, decision);

    res.json({
      status: "override recorded",
      userId
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





export default router;

// router.post("/evaluate", (req, res) => {
//   const result = calculateRisk(req.body);
//   res.json(result);
// });
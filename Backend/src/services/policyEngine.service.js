export const evaluatePolicy = async (riskScore) => {
  const response = await fetch("http://localhost:5678/webhook/paypilot-policy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ riskScore })
  });

  if (!response.ok) {
    throw new Error("Policy engine failed");
  }

  return response.json();
};


// n8n
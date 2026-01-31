
# 🚀 PayPilot — Pre-Transaction Financial Risk Interceptor

PayPilot is an intelligent fintech agent that protects users from harmful financial
decisions by **intercepting and stopping risky transactions before they are completed**.

Instead of analysing spending after money is lost, PayPilot operates in real time
and takes action at the moment a transaction is about to happen.

---

## 🧠 Core Idea

> Stop financial harm before it happens.

PayPilot acts as a financial safety agent that evaluates every transaction
**before execution** and decides whether it should be allowed, delayed, or blocked.

The system is designed with clear separation:
- **Logic** determines transaction risk
- **Policy rules** define what is allowed or blocked
- **AI** explains the decision in simple human language

---

## 🔍 What PayPilot Does

When a user initiates a transaction, PayPilot:

- Intercepts the transaction **before completion**
- Evaluates risk using deterministic rules and policies
- **Blocks, delays, or allows** the transaction based on risk level
- Provides a **clear explanation** for its decision using AI
- Maintains a full **audit trail** of why the action was taken

PayPilot enforces discipline **without silently taking control** —
every blocked action is explainable and reviewable.

---

## 🏗️ System Architecture

User → Frontend → Backend → n8n (Policy Engine) → Gemini AI

---


### Roles

| Layer | Responsibility |
|-----|----------------|
| Frontend | Collect user context, show risk, history, AI explanations |
| Backend (Express) | Risk calculation, trust tracking, DB persistence |
| n8n | Policy & threshold management (ALLOW / WARN / BLOCK) |
| Gemini | Human-friendly explanation (never decision making) |
| MongoDB | User profile, overrides, trust score |

---

## 📁 Repository Structure

paypilot/
├── Backend/
│ ├── src/
│ │ ├── routes/
│ │ ├── services/
│ │ ├── models/
│ │ └── server.js
│ ├── package.json
│ └── package-lock.json
│
├── Frontend/
│ ├── src/
│ ├── package.json
│ └── vite.config.js
│
└── README.md


---

## ⚙️ Risk Evaluation Model

Risk Score is computed using **transparent weighted factors**:

Risk Score = Amount vs Balance

- Spend Category
- Days to Rent / EMI
- Override History
- ± Trust Score Adjustment

---


### Decision Thresholds

| Risk Score | Decision |
|----------|----------|
| < 40 | ALLOW |
| 40 – 69 | WARN |
| ≥ 70 | BLOCK |

---

## 🔐 Trust & Overrides

- Users can **override warnings or blocks**
- Each override:
  - Reduces trust score
  - Is recorded in DB
- Trust **recovers automatically** after responsible behavior
- AI tone adapts:
  - Low trust → stricter explanations
  - High trust → calmer guidance

---

## 🤖 AI Usage (Gemini)

Gemini is used **only for explanation**.

It receives:
- Risk score
- Reasons for risk
- Trust score
- Past overrides
- Future commitments

It returns:
- Plain-English explanation
- Consequences
- Behavioral context

❌ Gemini never approves or blocks transactions  
❌ Gemini never touches money logic

---

## 🧪 Running Locally

### 1️⃣ Backend

```bash
cd Backend
npm install
npm run dev
```
Backend runs on:
```bash
(http://localhost:3000)
```

---
## 2️⃣ Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on:
```bash
(http://localhost:5173)
```

---
## 3️⃣ n8n
Start n8n locally:
```bash
n8n start
```

Webhook example used by PayPilot:
```bash
(http://localhost:5678/webhook/paypilot-policy)
```
---

## 🗃️ Environment Variables
Create a .env file inside the Backend/ folder
```bash
PORT=3000
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_api_key
```

Webhook example used by PayPilot:
```bash
(http://localhost:5678/webhook/paypilot-policy)
```
---
## 🏦 Why Banks / Fintechs Care

PayPilot can be:

- Embedded into digital wallets  
- Used as a bank SDK  
- Deployed as a compliance-friendly risk interception layer  

### Benefits

- Prevents financial harm **before** transactions happen  
- Improves long-term user trust through behavioral coaching  
- Fully auditable and explainable decision flow  
- Configurable risk rules without redeploying backend code  

---
---

## 🤝 Team & Collaboration

This project was built collaboratively with a strong focus on:
- Clear system design
- Responsible AI usage
- Real-world fintech constraints

All core decisions — risk logic, policy separation, and AI explainability — were discussed and implemented as a team.
We followed clean version control practices using Git and GitHub, with separate branches for frontend and backend development.

---

## 🙌 Acknowledgements

Thanks to our mentors and the GDG community for guidance, feedback, and the opportunity to explore preventive fintech systems.

---

## 👋 Closing Note

PayPilot is not just a hackathon prototype — it represents a shift toward **pre-emptive, responsible financial systems** where technology enforces discipline without removing user autonomy.

**Built with purpose. Designed for trust.**



import express from "express";
import cors from "cors";
import riskRoutes from "./routes/risk.route.js";

const app = express();

app.use(express.json());

app.use(cors());

app.use("/risk", riskRoutes);

export default app;

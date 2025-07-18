import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import resumeAnalyzer from "./routes/resumeAnalyzer.js";
import jobAnalyzer from "./routes/jobAnalyzer.js";


const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/resume-analyzer", resumeAnalyzer);
app.use("/api/job-analyzer", jobAnalyzer);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

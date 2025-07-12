
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import OpenAI from "openai";

const router = express.Router();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

router.post("/", async (req, res) => {
  const { jobDescription, resumeText, skills, projects, experienceYears } = req.body;

  if (!jobDescription || !resumeText || !skills || !projects) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prompt = `
You are an AI Job Match Analyzer. Analyze the given job description and candidate profile, and respond with ONLY valid strict JSON.

JSON Format:
{
  "Match Score": number (0-100),
  "Matched Skills": string[],
  "Missing Skills": string[],
  "Matched Projects": string[],
  "Suggestions for improvement": string[],
  "Experience Match": {
    "Job Requirement": string,
    "Candidate Experience": string,
    "Match": "Yes" or "No",
    "Comment": string
  },
  "Fit Summary": string (2–3 lines summary about how well the candidate fits)
}

Job Description:
${jobDescription}

Resume:
${resumeText}

Candidate Skills: ${skills.join(", ")}
Candidate Projects: ${projects.join(", ")}
Candidate Experience: ${experienceYears || "0"} years
Only return JSON. No explanation, no markdown.
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    const aiText = response.choices?.[0]?.message?.content.trim();

    try {
      const result = JSON.parse(aiText);
      return res.status(200).json({ result });
    } catch (err) {
      console.error("❌ JSON parse error:", aiText);
      return res.status(500).json({ error: "Invalid AI JSON", raw: aiText });
    }
  } catch (error) {
    console.error("Job Analyzer Error:", error);
    res.status(500).json({ error: "Failed to analyze job" });
  }
});

export default router;

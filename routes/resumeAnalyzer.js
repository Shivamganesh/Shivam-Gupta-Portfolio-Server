
import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();
const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  const { resumeText } = req.body;
  console.log("🔍 Resume text received:", resumeText.slice(0, 100), "...");

  if (!resumeText) return res.status(400).json({ error: "No resume text provided" });

  const messages = [
    {
      role: "system",
      content: `You are a professional resume analysis assistant.
Analyze the given resume and return a strict VALID JSON OBJECT with these fields:
{
  "Resume Score": number (0-100),
  "Category Scores": {
    "Skills": number,
    "Experience": number,
    "Projects": number,
    "Education": number,
    "Achievements": number,
    "ATS Compatibility": number
  },
  "Matched Keywords": string[],
  "Missing Keywords": string[],
  "Suggestions for improvement": string[],
  "Readability Score": string (A+ to D),
  "Grammar Issues": string[],
  "Action Verbs Used": string[],
  "Red Flags": string[],
  "ATS Compatibility Tips": string[],
  "AI Summary": string (a friendly 2-3 line summary of resume quality and suggested focus areas)
}
Return only valid JSON. No explanation. Only valid JSON.`,
    },
    {
      role: "user",
      content: `Analyze this resume and return the required JSON format:\n"""\n${resumeText}\n"""`,
    },
  ];

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages,
      temperature: 0.5,
    });

    const aiText = response.choices[0]?.message?.content;
    console.log("✅ AI Response:", aiText);
    const result = JSON.parse(aiText);
    res.status(200).json({ result });
  } catch (error) {
    console.error("❌ Resume Analyzer Error:", error.message);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

export default router;

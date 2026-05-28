import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing with 10MB limit for base64 photo uploads
app.use(express.json({ limit: "10mb" }));

// API Section
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Analyze Endpoint using @google/genai
app.post("/api/analyze-issue", async (req, res) => {
  const { imageData, fallbackType } = req.body;

  if (!imageData) {
    return res.status(400).json({ error: "No image data provided" });
  }

  // Graceful handling if Gemini API Key is missing or default
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY is not configured or placeholder. Simulating AI analysis.");
    
    // Polished simulated fallback based on fallbackType or default
    let simulatedResult = {
      title: "Pothole on Elm Street",
      category: "potholes",
      description: "A wide, jagged pothole developing in the center lane of Elm St., obstructing traffic lane.",
    };

    if (fallbackType === "graffiti") {
      simulatedResult = {
        title: "Graffiti Mural on Brick Wall",
        category: "graffiti",
        description: "Fresh spray-paint graffiti covering approximately 10 sq ft on the side brick wall of Queen St. business.",
      };
    } else if (fallbackType === "streetlight") {
      simulatedResult = {
        title: "Completely Dark Streetlight",
        category: "streetlights",
        description: "The street lamppost outside 142 Elm St has a broken or burnt bulb and fails to illuminate the sidewalk.",
      };
    } else if (fallbackType === "pothole_king") {
      simulatedResult = {
        title: "Deep Cracking Pothole",
        category: "potholes",
        description: "Extremely deep, expanding pothole crumbling at the edges in the middle lane of King Street.",
      };
    }

    // Artificially delay slightly to mimic real AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return res.json({
      ...simulatedResult,
      isSimulated: true,
      message: "Showing simulated AI analysis. Configure GEMINI_API_KEY in Secrets panel to connect live.",
    });
  }

  try {
    // Lazy initialize Gemini Client
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Strip out base64 header if present
    let rawBase64 = imageData;
    let mimeType = "image/jpeg";
    if (imageData.startsWith("data:")) {
      const parts = imageData.split(",");
      rawBase64 = parts[1];
      const mime = parts[0].match(/data:(.*?);/);
      if (mime) {
        mimeType = mime[1];
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: rawBase64,
          },
        },
        {
          text: "Analyze this image of a municipal civic issue. Classify it into one of three categories: 'potholes', 'graffiti', or 'streetlights', and write a concise, professional title (e.g. 'Deep pothole forming', 'Graffiti on brick facade') and a 1-2 sentence description explaining the issue.",
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, professional title summarizing the issue (4-7 words).",
            },
            category: {
              type: Type.STRING,
              description: "Must be exactly one of: 'potholes', 'graffiti', or 'streetlights'.",
            },
            description: {
              type: Type.STRING,
              description: "A precise, 1-2 sentence description detailing what is visible and why it is a hazard or nuisance.",
            },
          },
          required: ["title", "category", "description"],
        },
      },
    });

    const resultText = response.text?.trim() || "{}";
    const parsedData = JSON.parse(resultText);

    return res.json({
      title: parsedData.title || "Civic Issue Spotted",
      category: parsedData.category || "potholes",
      description: parsedData.description || "Spotted issue needing municipal attention.",
      isSimulated: false,
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: "AI analysis failed",
      details: error.message || error,
    });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded as custom middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production files from dist directory.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CivicPulse server running on http://localhost:${PORT}`);
  });
}

startServer();

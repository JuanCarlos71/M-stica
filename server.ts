import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Celestial Alchemy Mystic Engine" });
  });

  // AI Interpretation endpoint (Palmistry, Tarot, Astrology, Numerology)
  app.post("/api/mystic-ai", async (req, res) => {
    try {
      const { type, prompt, context } = req.body;
      const ai = getAIClient();

      if (!ai) {
        // Fallback gracefully if no API key is provided
        return res.json({
          success: false,
          fallback: true,
          message: "API key no configurada. Utilizando oráculo nativo del templo celestial."
        });
      }

      const systemInstruction = `Eres un sabio y respetado oráculo esotérico, maestro en astrología tradicional, quiromancia cabalística, numerología pitagórica y tarot místico de la orden "Celestial Alchemy".
Hablas en español con un tono poético, solemne, empático y lleno de sabiduría ancestral y precisión técnica.
Tus respuestas deben estar estructuradas con títulos elegantes, revelaciones profundas, consejos prácticos para el alma y una afirmación final de poder.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstruction}\n\n[SOLICITUD: ${type}]\n[CONTEXTO: ${JSON.stringify(context || {})}]\n\nConsulta o datos del consultante: ${prompt}`
              }
            ]
          }
        ]
      });

      res.json({
        success: true,
        text: response.text
      });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error al conectar con los planos superiores"
      });
    }
  });

  // Astronomical Ephemeris / Celestial Calendar endpoint
  app.get("/api/celestial-events", (_req, res) => {
    const now = new Date();
    const events = [
      {
        id: "moon-phase",
        title: "Fase Lunar Actual",
        description: "Luna Llena en Escorpio — Momento de revelaciones profundas y transmutación emocional.",
        date: now.toISOString().split("T")[0],
        type: "lunar",
        influence: "Transformación, intuición elevada, purificación de energías densas."
      },
      {
        id: "mercury-transit",
        title: "Mercurio en Acuario",
        description: "Claridad mental vanguardista y sincronicidades comunicativas.",
        date: "2026-08-22",
        type: "planetary",
        influence: "Innovación, ideas visionarias, telepatía intuitiva."
      },
      {
        id: "venus-trine",
        title: "Trígono Venus-Neptuno",
        description: "Apertura del chakra corazón a la belleza universal y al amor incondicional.",
        date: "2026-08-25",
        type: "aspect",
        influence: "Conexiones álmicas, magnetismo estético, revelaciones en sueños."
      }
    ];
    res.json({ success: true, events });
  });

  // Vite middleware in dev / Static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Celestial Alchemy Server running on port ${PORT}`);
  });
}

startServer();

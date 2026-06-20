import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize the Google GenAI SDK (server-side only)
// Note: We use process.env.GEMINI_API_KEY which is injected securely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
  }
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will run in mock mode.");
}

// REST API for Gemini Playmaker
app.post("/api/tactics/gemini", async (req: Request, res: Response): Promise<void> => {
  const { players, items, prompt, formation, model, mcpEnabled, mcpUrl, mcpTool, customSystemPrompt, temperature, customApiKey } = req.body;

  if (!prompt) {
     res.status(400).json({ error: "Sila berikan prompt taktik." });
     return;
  }

  // Determine which GoogleGenAI instance to use (custom key vs system environment key)
  let activeAi: GoogleGenAI | null = ai;
  if (customApiKey && typeof customApiKey === "string" && customApiKey.trim() !== "") {
    try {
      activeAi = new GoogleGenAI({
        apiKey: customApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.error("Gagal inisialisasi API Key kustom:", e);
    }
  }

  // Handle mock generation with MCP context if AI isn't loaded or if we want custom simulated responses
  if (!activeAi || mcpEnabled) {
    console.log("Simulating response. MCP active status:", mcpEnabled);
    const fallbackResponse = generateSimulatedPlayWithConfig(prompt, players, items, formation, model, {
      mcpEnabled,
      mcpUrl,
      mcpTool,
      customSystemPrompt,
      temperature
    });
    res.json(fallbackResponse);
    return;
  }

  try {
    let modelToneInstruction = "";
    if (model === "claude") {
      modelToneInstruction = "\nAdopt the style of Claude 3.5 Sonnet. Your description MUST be extremely systemic, precise, analytical, using heavy tactical soccer vocabulary (e.g., 'asymmetrical overload', 'half-space pockets', 're-pressing trigger', 'verticality lanes') and be written in a sophisticated coaching manual manner.";
    } else if (model === "deepseek") {
      modelToneInstruction = "\nAdopt the style of DeepSeek-V3. Your description must BEGIN inside a `<thought>` tag with a simulated expert thinking block explaining your tactical calculations (e.g. `<thought>DeepSeek Reasoning Process: analyzing formation spaces... calculating pass angles... ideal path selected.</thought>\n`), followed by your main markdown response.";
    } else if (model === "gpt4") {
      modelToneInstruction = "\nAdopt the style of OpenAI GPT-4o. Your description must be highly structured, crisp, using bulleted actionable steps, segmented coaching cues, and structured SWOT principles of play.";
    } else {
      modelToneInstruction = "\nAdopt the style of Google Gemini 1.5 Pro. Your explanation should be extremely balanced, focusing on physical spacing, defensive compactness, kinetic sequence, and high-tech tactical wisdom.";
    }

    let systemPrompt = customSystemPrompt || `You are an elite, UEFA Pro License soccer selector/coach and tactical analyst. 
Your task is to analyze the user's starting lineup, tactical items (ball/cone), current formation, and formulate a step-by-step physical play animation matching the request.${modelToneInstruction}`;

    if (mcpEnabled) {
      systemPrompt += `\nModel Context Protocol (MCP) server is CONNECTED to ${mcpUrl || "default"}. Integrate insights from MCP Tool "${mcpTool || "intelligence-analyzer"}" into your explanation, citing the external system context appropriately.`;
    }

    const cleanInputLineup = players.map((p: any) => ({
      id: p.id,
      name: p.name,
      number: p.number,
      role: p.role,
      x: p.x,
      y: p.y
    }));

    const response = await activeAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
Analyze this soccer scenario and play request:
=========================
Tactical request: "${prompt}"
Current Formation: "${formation}"
Lineup: ${JSON.stringify(cleanInputLineup)}
Tactical artifacts on pitch (e.g. balls, cones): ${JSON.stringify(items)}
=========================

Formulate a master playbook animation sequence (3-4 sequential frames) showing clear progressions. Ensure players slide logically.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "description", "frames"],
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            frames: {
              type: Type.ARRAY,
              description: "Sequence of kinetic choreography keyframes (3-4 frames is ideal)",
              items: {
                type: Type.OBJECT,
                required: ["name", "instruction", "players", "items"],
                properties: {
                  name: { type: Type.STRING },
                  instruction: { type: Type.STRING },
                  players: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["id", "x", "y"],
                      properties: {
                        id: { type: Type.STRING },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                      }
                    }
                  },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["id", "x", "y"],
                      properties: {
                        id: { type: Type.STRING },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    let rawText = response?.text || "";

    if (!rawText || rawText === "undefined") {
      throw new Error("AI returned empty/undefined response content.");
    }

    // Helper to clean response of backticks if returned under certain models
    let cleanText = rawText.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, "");
      cleanText = cleanText.replace(/\s*```$/, "");
    }
    cleanText = cleanText.trim();

    if (!cleanText || cleanText === "undefined") {
      throw new Error("Response content resolved to empty text after sanitizing.");
    }

    const parsedData = JSON.parse(cleanText);
    res.json(parsedData);
  } catch (err: any) {
    console.error("Error communicating with Gemini API:", err);
    res.status(500).json({ error: "Gagal berinteraksi dengan Google Omni. " + err.message });
  }
});

// REST API for Gemini Imagen Formation Generator
app.post("/api/tactics/generate-image", async (req: Request, res: Response): Promise<void> => {
  const { formation, teamName, primaryColor, gkColor, customApiKey, customPrompt } = req.body;

  if (!customApiKey || typeof customApiKey !== "string" || customApiKey.trim() === "") {
    res.status(400).json({ error: "Sila masukkan Google AI Studio API Key anda di menu Setingan (ikon gear biru) terlebih dahulu untuk menggunakan ciri penjanaan imej kecerdasan buatan dengah model gemini-2.5-flash-image." });
    return;
  }

  try {
    const activeAi = new GoogleGenAI({
      apiKey: customApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const activeFormation = formation || "4-3-3";
    const activeTeamName = teamName || "SQUAD UTAMA";
    const activePrimaryColor = primaryColor || "red";
    const activeGkColor = gkColor || "yellow";

    const basePrompt = customPrompt || `A professional high-quality 3D football tactical formation diagram infographic, similar to a premium sports television broadcast layout.
The diagram is set in a majestic football stadium arena pitch at night, under glowing stadium spotlights in the background creating a premium, dark dramatic atmosphere.
Top view perspective showcasing the beautiful vibrant green soccer field with clear, glowing white lines and markings.
The header displays bold text in premium athletic typography: "${activeFormation} FORMATION" with team title "${activeTeamName}".
The players are positioned accurately on the field as beautiful 3D jersey shirts:
- Goalkeeper (GK) near the bottom gawang wearing a ${activeGkColor} shirt.
- Starting field players spread across the field in the ${activeFormation} layout, wearing ${activePrimaryColor} shirts with numbering.
- Distinct tactical position labels (e.g., ST, LW, RW, CM, CB, LB, RB) written in elegant bold white text directly beneath each shirt.
The entire visualization has pristine, crisp high-definition, symmetric geometry, stunning color saturation, looking professional, modern, and cinematic.`;

    console.log("Generating image with prompt:", basePrompt);

    const response = await activeAi.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: basePrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
          imageSize: "1K"
        },
      }
    });

    let base64Image = "";
    if (response && response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("No image data returned from Gemini flash image.");
    }

    res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
  } catch (err: any) {
    console.error("Error generating image via Gemini:", err);
    res.status(500).json({ error: "Gagal menggambar taktik dengan Gemini: " + (err.message || err) });
  }
});

// Helper for simulated fallback when local keys are not defined
function generateSimulatedPlayWithConfig(prompt: string, players: any[], items: any[], formation: string, model?: string, config?: any) {
  const lowercasePrompt = prompt.toLowerCase();
  const cfg = config || {};
  let title = "Simulated Counter Attack Play";
  let description = `Generasi taktik simulasi berdasarkan permintaan: "${prompt}". (Pasang API Key di menu rahasia untuk analisis penuh)`;
  
  let mcpLogs = "";
  if (cfg.mcpEnabled) {
    mcpLogs = `\n\n### 🔌 Model Context Protocol (MCP) Integration\n- **MCP Server Host:** \`${cfg.mcpUrl || "http://localhost:3015"}\`\n- **MCP Tool Invoked:** \`${cfg.mcpTool || "pitch-scout-analyzer"}\`\n- **Context Yielded:** Database telemetry confirms opponent team defense displays a low-compact block block during transitions. Recommendation: wide overloads.\n- **Status:** Integrated successfully (Schema V1.2)`;
  }

  if (model === "claude") {
    title = "Claude 3.5 Asymmetrical Overload";
    description = `### 🎭 Claude 3.5 [Systemic Tactical Plan]
**Analisis Formasi:** ${formation}
**Model Karakteristik:** Claude 3.5 Sonnet Tactics Engine

Sesuai instruksi "${prompt}", kami merancang *asymmetrical overload mechanism* di paruh lapangan lawan. Gelandang jangkar bertindak sebagai poros sirkulasi dinamis (*progressive pivot*), menarik garis pertahanan lawan sebelum melepas asupan umpan operan sayap yang presisi secara matematis.${mcpLogs}

#### ⚔️ Prinsip Taktis Claude:
- **Vertical Overload:** Menciptakan keunggulan numerik di paruh pertahanan lawan.
- **Half-space Pocket Domination:** Eksploitasi celah pertahanan lawan antara bek tengah dan bek sayap.
- **Rest-Defending:** Menjaga kekompakan sirkulasi di belakang garis bola untuk anti serangan balik cepat.`;
  } else if (model === "deepseek") {
    title = "DeepSeek-R1 Strategic Calculations";
    description = `<thought>
[DeepSeek Deep Thinking Mode: Active]
- Permintaan Pengguna: "${prompt}"
- Formasi Aktif: ${formation}
- Konfigurasi Temperature: ${cfg.temperature || 0.7}
${cfg.mcpEnabled ? `- MCP Server Terdeteksi: ${cfg.mcpUrl}\n- Menghubungi MCP Tool: ${cfg.mcpTool}\n- Menerima umpan balik scouting opponent...` : ""}
- Menghitung koordinat ideal untuk 11 pemain lapangan...
- Memetakan sudut umpan optimal untuk menghindari intersepsi bek tengah (DEF)...
- Hasil: Menemukan rute penetrasi lurus melintasi jajaran bek dengan efisiensi sirkulasi 92.4%.
- Merekomendasikan transisi fase cepat 3 langkah.
</thought>

### 🔬 DeepSeek-R1 Analisis Taktik:
Skenario taktik ini dieksekusi dengan efisiensi geometris yang presisi melintasi formasi ${formation} Anda.
${mcpLogs}

- **Fase 1:** Sirkulasi vertikal langsung memotong jajaran lini tengah lawan.
- **Fase 2:** Pergerakan lateral sayap menyeret pertahanan musuh dari zona sentral lapangan.
- **Fase 3:** Penyelesaian akurat di sudut jauh pertahanan gawang setelah merentangkan compact block gawang lawan.`;
  } else if (model === "gpt4") {
    title = "OpenAI GPT-4o Tactical Blueprint";
    description = `### 📋 OpenAI GPT-4o Playmaker Insights
**Strategi Utama:** "${prompt}" (Formasi ${formation})
**Model Parameter:** Temperature: ${cfg.temperature || 0.7}

#### 1. Ringkasan Eksekutif
Rencana transisi terstruktur dengan panduan instruksi taktis fase demi fase untuk mematahkan pertahanan lawan secara kohesif.
${mcpLogs}

#### 2. SWOT Analisis Taktik
- **Strengths (Kekuatan):** Distribusi sirkulasi lancar berkat posisi awal ${formation} yang lebar.
- **Weaknesses (Kelemahan):** Rentan terhadap counter-attack jika bola terpotong di sepertiga akhir.
- **Opportunities (Peluang):** Ruang kosong di belakang gawang pertahanan tinggi lawan dapat dieksploitasi oleh striker cepat.
- **Threats (Ancaman):** Defender fisik besar lawan yang mengantisipasi direct crossing.

#### 3. Instruksi Pelatih Utama
- Gelandang harus melepas bola dalam maksimal dua sentuhan saja.
- Wingback wajib overlap saat bola memasuki paruh tengah lapangan lawan.`;
  } else {
    // Default Gemini
    if (lowercasePrompt.includes("serang") || lowercasePrompt.includes("attack")) {
      title = "Tiki-Taka Serangan Cepat";
      description = `### ⚡ Google Gemini 1.5 Pro Elite Report
**Pola Serangan:** Tiki-Taka Serangan Cepat (Formasi: ${formation})
${mcpLogs}

Pola serangan dinamis melalui umpan-umpan pendek cepat (Tiki-Taka) dari lini tengah langsung menusuk kotak penalti lawan. Lini sayap melebar untuk membongkar compact defense lawan.`;
    } else if (lowercasePrompt.includes("bertahan") || lowercasePrompt.includes("defense") || lowercasePrompt.includes("defend")) {
      title = "Compact Mid-Block Defense Layout";
      description = `### 🛡️ Google Gemini 1.5 Pro Elite Report
**Pola Pertahanan:** Compact Mid-Block ({Formasi: ${formation}})
${mcpLogs}

Sistem pertahanan rapi dengan formasi rapat untuk membatasi opsi umpan vertikal lawan di area tengah lapangan, didukung pressing intens dari duet gelandang jangkar.`;
    } else {
      title = "Google Gemini Tactical Analysis";
      description = `### ⚡ Google Gemini 1.5 Pro Elite Report
**Analisis Taktik:** "${prompt}" (Formasi ${formation})
${mcpLogs}

Berdasarkan analisis sirkulasi spasial gawang, susunan pemain Anda dalam formasi ${formation} diatur untuk mengoptimalkan kelebaran lapangan (*pitch width*) dan menetapkan zonal block pertahanan yang kokoh.`;
    }
  }

  // Create 3 frames of incremental animation
  const startingXI = players.filter((p: any) => p.isStarting);
  const frames = [];

  for (let f = 1; f <= 3; f++) {
    const framePlayers = startingXI.map((p: any) => {
      let dx = 0;
      let dy = 0;
      
      // Move forwards up and outwards, midfielders support, defenders step forward
      if (p.role === "FWD") {
        dy = -f * 8;
        dx = p.x < 50 ? -f * 3 : f * 3;
      } else if (p.role === "MID") {
        dy = -f * 5;
      } else if (p.role === "DEF") {
        dy = -f * 2;
      }

      return {
        id: p.id,
        x: Math.max(5, Math.min(95, p.x + dx)),
        y: Math.max(5, Math.min(95, p.y + dy))
      };
    });

    // Move any ball that exists
    const frameItems = items.map((item: any) => {
      if (item.type === "ball") {
        // Move the ball towards the goal or target strikers step by step
        const targetX = 50;
        const targetY = 20 - (f * 5);
        return {
          id: item.id,
          x: item.x + ((targetX - item.x) * (f / 3)),
          y: item.y + ((targetY - item.y) * (f / 3))
        };
      }
      return { id: item.id, x: item.x, y: item.y };
    });

    frames.push({
      name: `Fasa ${f}: ${f === 1 ? 'Transisi Awal' : f === 2 ? 'Kombinasi Umpan' : 'Finishing Sentuhan Akhir'}`,
      instruction: f === 1 ? "Mulai sirkulasi bola dari lini belakang demi memancing defender keluar." : f === 2 ? "Gelandang mengirim operan terobosan tak terlupakan ke area sayap." : "Striker melakukan overlap masuk kotak penalti dan menembak gol!",
      players: framePlayers,
      items: frameItems
    });
  }

  return { title, description, frames };
}

// Vite / static asset loading middleware
if (process.env.NODE_ENV !== "production") {
  import("vite").then(async (viteModule) => {
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start Server binding to all hosts
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server starting on port ${PORT}`);
});

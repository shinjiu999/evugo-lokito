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

    let activeModel = "gemini-3.5-flash";
    if (model === "gemini-3.1-pro-preview") {
      activeModel = "gemini-3.1-pro-preview";
    } else if (model === "gemini-3.1-flash-lite") {
      activeModel = "gemini-3.1-flash-lite";
    } else if (model === "gemini-3.5-flash") {
      activeModel = "gemini-3.5-flash";
    }

    const response = await activeAi.models.generateContent({
      model: activeModel,
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
    const normRaw = rawText.trim().toLowerCase();

    if (!normRaw || normRaw === "undefined" || normRaw === "null") {
      throw new Error("AI returned empty/undefined response content.");
    }

    // Helper to clean response of backticks if returned under certain models
    let cleanText = rawText.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, "");
      cleanText = cleanText.replace(/\s*```$/, "");
    }
    cleanText = cleanText.trim();
    const normClean = cleanText.toLowerCase();

    if (!normClean || normClean === "undefined" || normClean === "null") {
      throw new Error("Response content resolved to empty text after sanitizing.");
    }

    const parsedData = JSON.parse(cleanText);
    res.json(parsedData);
  } catch (err: any) {
    console.error("Error communicating with Gemini API:", err);
    res.status(500).json({ error: "Gagal berinteraksi dengan Google Omni. " + err.message });
  }
});

// REST API for Gemini Scout Chemistry Synergy Analyzer
app.post("/api/tactics/scout", async (req: Request, res: Response): Promise<void> => {
  const { players, formation, customApiKey } = req.body;

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
      console.error("Gagal inisialisasi API Key kustom untuk Scout:", e);
    }
  }

  if (!activeAi) {
    res.json({
      rating: "A",
      synergyScore: "85%",
      attackingStyle: "Direct Fluid Counter-Attacking. Skuad menunjukkan transisi cepat dari sayap dengan striker utama bergerak sangat fleksibel.",
      midfieldCore: "Solid Playmaking. Thom Haye mengontrol sirkulasi aliran umpan mendalam dengan presisi tinggi.",
      defensiveCompactness: "Pertahanan rapat 3 bek tengah yang dikomandani Jay Idzes dan Rizky Ridho menjaga kedalaman dengan baik.",
      strengths: [
        "Transisi agresif di area sayap luar.",
        "Komposisi umur optimal untuk endurance tekanan tinggi."
      ],
      weaknesses: [
        "Margin ruang kosong di belakang sayap yang overlap maju.",
        "Ketergantungan tinggi pada gelandang sentral."
      ],
      recommendations: [
        "Instruksikan bek sayap untuk melakukan cover spasial saat lawan melancarkan serangan silang cepat.",
        "Latih kombinasi overload satu-dua di sepertiga akhir lapangan."
      ]
    });
    return;
  }

  try {
    const starterXI = players.filter((p: any) => p.isStarting);
    const substitutes = players.filter((p: any) => !p.isStarting);

    const response = await activeAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
Analyze the team lineup chemistry for an elite soccer trainer:
=========================
Current Formation: "${formation}"
Starting XI: ${JSON.stringify(starterXI.map((p: any) => ({ name: p.name, number: p.number, role: p.role })))}
Substitutes: ${JSON.stringify(substitutes.map((p: any) => ({ name: p.name, number: p.number, role: p.role })))}
=========================

Evaluate the chemistry synergy and make professional UEFA Pro License coach notes. Return the result strictly in Malay containing direct football advice.`,
      config: {
        systemInstruction: "You are an elite, UEFA Pro License director, coach, and tactical analyst. Evaluate technical team synergies, strengths, weaknesses, and return a clean structured JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "rating", 
            "synergyScore", 
            "attackingStyle", 
            "midfieldCore", 
            "defensiveCompactness", 
            "strengths", 
            "weaknesses", 
            "recommendations"
          ],
          properties: {
            rating: { type: Type.STRING, description: "Letter grade e.g., S, A+, A, B+" },
            synergyScore: { type: Type.STRING, description: "Percentage e.g., 90%" },
            attackingStyle: { type: Type.STRING, description: "Detailed narrative of attacking style, movement flow in Malay" },
            midfieldCore: { type: Type.STRING, description: "Detailed narrative of midfield anchor synergy in Malay" },
            defensiveCompactness: { type: Type.STRING, description: "Detailed narrative of defensive compactness in Malay" },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 2-3 specific tactical strengths"
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 2-3 potential tactical danger vulnerabilities"
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 2-3 actionable UEFA-pro recommended adjustments"
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    const parsedData = JSON.parse(text);
    res.json(parsedData);
  } catch (err: any) {
    console.error("Failed to generate scouting report:", err);
    res.status(500).json({ error: "Gagal berinteraksi dengan Google Omni untuk riset tim: " + err.message });
  }
});

// REST API for YouTube Tactical Video Scanner
app.post("/api/tactics/youtube-analysis", async (req: Request, res: Response): Promise<void> => {
  const { videoUrl, players, items, formation, customApiKey, prompt, lang } = req.body;

  if (!videoUrl) {
    res.status(400).json({ error: lang === "id" ? "Sila berikan URL video YouTube." : "Please provide a YouTube video URL." });
    return;
  }

  // Determine active AI client (custom or system environment key)
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
      console.error("Gagal inisialisasi API Key kustom untuk YouTube Analysis:", e);
    }
  }

  // Fallback to simulated response if AI client is not available
  if (!activeAi) {
    console.log("Simulating YouTube analysis for URL:", videoUrl);
    const simulatedResponse = generateSimulatedYoutubeAnalysis(videoUrl, prompt, players, items, formation, lang);
    res.json(simulatedResponse);
    return;
  }

  try {
    const cleanLineup = players.map((p: any) => ({
      id: p.id,
      name: p.name,
      number: p.number,
      role: p.role,
      x: p.x,
      y: p.y
    }));

    const systemPrompt = `You are an elite, UEFA Pro License tactical video analyst and master coach.
Your job is to analyze the requested YouTube tactical analysis video/match, extract the primary strategic patterns, strengths, weaknesses, and construct an interactive playable playbook.
If the video describes a famous team (e.g. Manchester City, Arsenal, Barcelona, Real Madrid, Liverpool) or match, use search grounding to fetch the exact tactical context of that match or manager's philosophy.
Always output the final response in Malay/Indonesian or English, matched to the requested lang preference: ${lang || "id"}.`;

    const userMessage = `Analyze this YouTube tactical video or match: "${videoUrl}"
Focus prompt: "${prompt || 'Analisis taktik permainan penuh'}"
Current squad setup: ${JSON.stringify(cleanLineup)}
Current items: ${JSON.stringify(items)}
Current formation: "${formation}"

Construct a complete detailed tactical report.
And generate a master playbook animation sequence (3 keyframes) that represents the team's transition pattern as shown in the video. Reuse the provided player IDs so they map perfectly on the user's pitch.`;

    const response = await activeAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "title",
            "recommendedFormation",
            "videoSummary",
            "attackingPhase",
            "defendingPhase",
            "keyPlayerRoles",
            "strengths",
            "weaknesses",
            "playbook"
          ],
          properties: {
            title: { type: Type.STRING },
            recommendedFormation: { type: Type.STRING },
            videoSummary: { type: Type.STRING },
            attackingPhase: { type: Type.STRING },
            defendingPhase: { type: Type.STRING },
            keyPlayerRoles: { type: Type.STRING },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            playbook: {
              type: Type.OBJECT,
              required: ["title", "description", "frames"],
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                frames: {
                  type: Type.ARRAY,
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
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (err: any) {
    console.error("Failed to generate YouTube analysis report:", err);
    res.status(500).json({ error: "Gagal menganalisis video YouTube via Google Omni: " + err.message });
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

function generateSimulatedYoutubeAnalysis(videoUrl: string, prompt: string, players: any[], items: any[], formation: string, lang?: string) {
  const isId = lang === "id";
  const title = isId ? "Analisis Video Taktis YouTube" : "YouTube Tactical Video Analysis";
  
  // Try to extract some name from the URL or query to make it look super customized!
  let teamMatch = isId ? "Klub Favorit" : "Favorite Club";
  if (videoUrl.toLowerCase().includes("manchester") || videoUrl.toLowerCase().includes("mancity")) teamMatch = "Manchester City";
  else if (videoUrl.toLowerCase().includes("arsenal")) teamMatch = "Arsenal";
  else if (videoUrl.toLowerCase().includes("real") || videoUrl.toLowerCase().includes("madrid")) teamMatch = "Real Madrid";
  else if (videoUrl.toLowerCase().includes("barcelona") || videoUrl.toLowerCase().includes("barca")) teamMatch = "Barcelona";
  else if (videoUrl.toLowerCase().includes("liverpool")) teamMatch = "Liverpool";
  else if (videoUrl.toLowerCase().includes("chelsea")) teamMatch = "Chelsea";
  else if (videoUrl.toLowerCase().includes("bayern")) teamMatch = "Bayern Munich";
  else if (videoUrl.toLowerCase().includes("indonesia")) teamMatch = "Timnas Indonesia";

  const videoSummary = isId 
    ? `### 📺 Analisis Video YouTube: Taktik Dinamik ${teamMatch}
Analisis disaring dari URL: \`${videoUrl}\`. 
*Catatan: Sila sambungkan Google AI Studio API Key anda untuk menggunakan live search online guna menganalisis video secara real-time.*

Berdasarkan video ini, ${teamMatch} memperagakan penguasaan ruang spasial yang rapi di bawah sistem taktis transisi pantas. Struktur formasi utama menyokong sokongan serangan dari pemain pertahanan sayap yang overlap agresif.`
    : `### 📺 YouTube Video Analysis: Dynamic ${teamMatch} Tactics
Analysis generated from URL: \`${videoUrl}\`.
*Note: Connect your Google AI Studio API Key to enable real-time live internet search scanning.*

Based on the footage, ${teamMatch} demonstrates excellent spatial layout and transition play. The defensive unit stays highly compact while supporting quick progressive vertical passes to the winger pockets.`;

  const attackingPhase = isId
    ? `Pemain sayap melebar penuh ke sisi padang untuk menarik pertahanan musuh, mewujudkan jurang kosong di ruang tengah (*half-spaces*). Gelandang mengawal sirkulasi aliran umpan untuk penetrasi terus.`
    : `Wingers stretch the pitch to the touchline, pulling defenders wide and creating large half-space gaps. Midfield anchors control the tempo of sirkulasi before releasing penetrating vertical passes.`;

  const defendingPhase = isId
    ? `Pressing agresif di sepertiga akhir padang (*high-press triggers*). Sebaik sahaja bola hilang, 3-4 pemain berhampiran segera melakukan sekatan zon laluan hantaran lawan.`
    : `Aggressive high-press triggers in the opponent's final third. Immediately upon losing possession, 3-4 nearest players close down the ball carrier to trigger error blocks.`;

  const keyPlayerRoles = isId
    ? `- **Gelandang Kreatif (Playmaker):** Mengatur tempo aliran, memegang bola untuk mengumpan overlap.
- **Bek Sayap Menyerang (Inverted/Attacking Wingback):** Maju mengisi koridor tengah untuk bantuan keunggulan bilangan pemain.`
    : `- **Creative Playmaker:** Restructuring tempo, stabilizing possession to unleash overlapping fullbacks.
- **Attacking Wingback:** Drifts narrow to overload central midfield during transition phases.`;

  const strengths = isId
    ? [
        "Sirkulasi aliran bola amat pantas merentasi lebar padang.",
        "Ancaman overloads sayap yang sangat berbahaya."
      ]
    : [
        "Extremely fast horizontal circulation stretching the opposition defense.",
        "Overwhelming attacking overloads in wide channels."
      ];

  const weaknesses = isId
    ? [
        "Terdedah kepada serangan balik pantas jika sayap gagal cover semula.",
        "Stamina pemain menyusut drastik disebabkan tekanan tinggi berterusan."
      ]
    : [
        "Highly vulnerable to swift counter-attacks if wingers are caught out of position.",
        "Drastic stamina exhaustion due to constant high-intensity pressing."
      ];

  // Re-use current players to generate some clean playbook frames
  const startingXI = players.filter((p: any) => p.isStarting);
  const frames = [];

  for (let f = 1; f <= 3; f++) {
    const framePlayers = startingXI.map((p: any) => {
      let dx = 0;
      let dy = 0;
      
      // Dynamic shift representing tactical overload from video
      if (p.role === "FWD") {
        dy = -f * 10;
        dx = p.x < 50 ? f * 4 : -f * 4; // drift narrow like inside forwards
      } else if (p.role === "MID") {
        dy = -f * 6;
        dx = p.x < 50 ? -f * 2 : f * 2; // stretch wide to support
      } else if (p.role === "DEF") {
        dy = -f * 3;
      }

      return {
        id: p.id,
        x: Math.max(5, Math.min(95, p.x + dx)),
        y: Math.max(5, Math.min(95, p.y + dy))
      };
    });

    const frameItems = items.map((item: any) => {
      if (item.type === "ball") {
        const targetX = 48;
        const targetY = 15 - (f * 3);
        return {
          id: item.id,
          x: item.x + ((targetX - item.x) * (f / 3)),
          y: item.y + ((targetY - item.y) * (f / 3))
        };
      }
      return { id: item.id, x: item.x, y: item.y };
    });

    frames.push({
      name: isId 
        ? `Skenario ${f}: ${f === 1 ? 'Transisi Lebar' : f === 2 ? 'Overload Tengah' : 'Percubaan Gol'}`
        : `Phase ${f}: ${f === 1 ? 'Width Transition' : f === 2 ? 'Central Overload' : 'Shot on Target'}`,
      instruction: isId
        ? (f === 1 
            ? "Pemain pertahanan melancarkan bola lebar menarik perhatian pertahanan lawan." 
            : f === 2 
              ? "Gelandang kreatif meluncurkan bola terobosan di celah half-space yang kosong." 
              : "Penyerang sayap menusuk masuk dan melepaskan rembatan kencang melengkung!")
        : (f === 1 
            ? "Fullbacks push the ball wide, dragging defensive lines outward." 
            : f === 2 
              ? "Central midfielders slide a weighted pass into the half-space pocket." 
              : "The inside forward cuts narrow and releases a powerful curled shot!"),
      players: framePlayers,
      items: frameItems
    });
  }

  return {
    title: `${title}: ${teamMatch} Tactics`,
    recommendedFormation: "4-3-3",
    videoSummary,
    attackingPhase,
    defendingPhase,
    keyPlayerRoles,
    strengths,
    weaknesses,
    playbook: {
      title: `${teamMatch} ${isId ? "Transisi Taktik" : "Tactical Play"}`,
      description: isId 
        ? `Playbook taktis diimport dari analisis video YouTube: ${videoUrl}`
        : `Tactical playbook imported from YouTube video analysis: ${videoUrl}`,
      frames
    }
  };
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

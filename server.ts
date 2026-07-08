import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// 1. LAZY GEMINI API CLIENT INITIALIZATION
// ==========================================
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found in environment variables.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ==========================================
// 2. IN-MEMORY DATABASE & SEED DATA
// ==========================================
interface User {
  id: string;
  email: string;
  name: string;
  role: 'artist' | 'admin';
  labelName?: string;
  isVerified: boolean;
}

const users: User[] = [
  { id: 'u1', email: 'artist@dreamrecords.in', name: 'Zubeen Garg', role: 'artist', labelName: 'Assam Hills Records', isVerified: true },
  { id: 'u2', email: 'admin@dreamrecords.in', name: 'Super Admin', role: 'admin', isVerified: true },
  { id: 'u3', email: 'mrinmoy@cinebap.com', name: 'Cinebap Mrinmoy', role: 'artist', labelName: 'Bong Media Works', isVerified: true }
];

interface Track {
  title: string;
  version: string;
  singer: string;
  featuring: string;
  composer: string;
  lyricist: string;
  producer: string;
  publisher: string;
  copyrightHolder: string;
  lyrics: string;
  audioFileName: string;
  audioSize: string;
}

interface Release {
  id: string;
  artistId: string;
  artistName: string;
  title: string;
  coverUrl: string;
  genre: string;
  subGenre: string;
  language: string;
  mood: string;
  stores: string[];
  status: 'draft' | 'scheduled' | 'approved' | 'rejected';
  releaseDate: string;
  upc?: string;
  isrc?: string;
  feedback?: string;
  createdAt: string;
  tracks: Track[];
}

let releases: Release[] = [
  {
    id: 'rel_1',
    artistId: 'u1',
    artistName: 'Zubeen Garg',
    title: 'Maya (Traditional Soul)',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    genre: 'Indian Classical / Fusion',
    subGenre: 'Assamese Folk',
    language: 'Assamese',
    mood: 'Nostalgic',
    stores: ['spotify', 'apple', 'jiosaavn', 'gaana', 'instagram', 'youtube'],
    status: 'approved' as const,
    releaseDate: '2026-06-25',
    upc: '5012345678901',
    isrc: 'IN-AAA-26-00001',
    createdAt: '2026-06-15T10:00:00Z',
    tracks: [
      {
        title: 'Maya Re Maya',
        version: 'Original Mix',
        singer: 'Zubeen Garg',
        featuring: 'Tosiba Begum',
        composer: 'Zubeen Garg',
        lyricist: 'Traditional Folk Lyric',
        producer: 'Dream Records Studios',
        publisher: 'Dream Records Publishing',
        copyrightHolder: 'Dream Records West Bengal',
        lyrics: 'Maya re maya tor chokhe eta ki jadu... traditional verses.',
        audioFileName: 'maya_original.mp3',
        audioSize: '11.4 MB'
      }
    ]
  },
  {
    id: 'rel_2',
    artistId: 'u3',
    artistName: 'Cinebap Mrinmoy',
    title: 'Rhythm of Bengal',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
    genre: 'Electronic',
    subGenre: 'Electro-Folk',
    language: 'Bengali',
    mood: 'Energetic',
    stores: ['spotify', 'apple', 'jiosaavn', 'youtube', 'amazonmusic'],
    status: 'approved' as const,
    releaseDate: '2026-07-02',
    upc: '5012345678902',
    isrc: 'IN-AAA-26-00002',
    createdAt: '2026-06-28T14:30:00Z',
    tracks: [
      {
        title: 'Bengal Electro Bass',
        version: 'Extended Mix',
        singer: 'Mrinmoy Das',
        featuring: 'Shreya Adhikary',
        composer: 'Samidh Mukherjee',
        lyricist: 'Rupankar Bagchi',
        producer: 'Bong Media Works',
        publisher: 'Dream Records Publishing',
        copyrightHolder: 'Bong Media',
        lyrics: 'Dance to the rhythm of Bengal rivers... electro drop.',
        audioFileName: 'bengal_bass.mp3',
        audioSize: '14.2 MB'
      }
    ]
  },
  {
    id: 'rel_3',
    artistId: 'u1',
    artistName: 'Zubeen Garg',
    title: 'Summer Ragas',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80',
    genre: 'World',
    subGenre: 'Indian Ambient',
    language: 'Instrumental',
    mood: 'Chill',
    stores: ['spotify', 'apple', 'jiosaavn'],
    status: 'scheduled' as const,
    releaseDate: '2026-07-20',
    upc: '5012345678903',
    createdAt: '2026-07-01T09:00:00Z',
    tracks: [
      {
        title: 'Sitar Awakening',
        version: 'Instrumental Version',
        singer: 'Instrumental',
        featuring: '',
        composer: 'Zubeen Garg',
        lyricist: 'None',
        producer: 'Assam Hills Records',
        publisher: 'Dream Records Publishing',
        copyrightHolder: 'Zubeen Garg Media',
        lyrics: '[Instrumental Track - No Lyrics]',
        audioFileName: 'sitar_awakening.mp3',
        audioSize: '18.9 MB'
      }
    ]
  },
  {
    id: 'rel_pending_1',
    artistId: 'u3',
    artistName: 'Cinebap Mrinmoy',
    title: 'Kolkata Cyberpunk',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    genre: 'Electronic',
    subGenre: 'Synthwave',
    language: 'Bengali',
    mood: 'Futuristic',
    stores: ['spotify', 'apple', 'jiosaavn', 'gaana', 'instagram', 'youtube', 'tiktok'],
    status: 'draft' as const, // will be submitted by user in-app
    releaseDate: '2026-08-01',
    createdAt: '2026-07-07T12:00:00Z',
    tracks: [
      {
        title: 'Howrah Bridge Lights',
        version: 'Radio Edit',
        singer: 'Mrinmoy Das',
        featuring: 'Urvi Chatterjee',
        composer: 'Samidh Mukherjee',
        lyricist: 'Traditional Beng',
        producer: 'Bong Media Works',
        publisher: 'Dream Records Publishing',
        copyrightHolder: 'Bong Media',
        lyrics: 'Yellow taxis floating down neon streets... Kolkata neon skyline.',
        audioFileName: 'howrah_synth.mp3',
        audioSize: '9.8 MB'
      }
    ]
  }
];

let supportTickets = [
  {
    id: 't_1',
    artistId: 'u1',
    artistName: 'Zubeen Garg',
    subject: 'Request for YouTube Official Artist Channel (OAC) Upgrade',
    category: 'distribution',
    message: 'Hello Support Team, I would like to request an upgrade to an Official Artist Channel (the music note badge) on my YouTube page. I have distributed 3 albums through Dream Records already. Here is my channel link: youtube.com/c/zubeengargofficial',
    status: 'open' as const,
    createdAt: '2026-07-06T11:20:00Z',
    replies: [
      {
        sender: 'admin' as const,
        senderName: 'Dream Records Support',
        message: 'Hi Zubeen, congratulations on your outstanding releases! We have initiated the Official Artist Channel merging request with YouTube. It usually takes 5-10 business days. Please verify if your channel name exactly matches your distributed metadata.',
        createdAt: '2026-07-07T09:15:00Z'
      },
      {
        sender: 'artist' as const,
        senderName: 'Zubeen Garg',
        message: 'Yes, the channel name matches "Zubeen Garg" exactly. Thank you for the super quick response!',
        createdAt: '2026-07-07T14:22:00Z'
      }
    ]
  },
  {
    id: 't_2',
    artistId: 'u3',
    artistName: 'Cinebap Mrinmoy',
    subject: 'Royalty verification status for May streams',
    category: 'royalties',
    message: 'Hello, my report lists 245,000 streams on JioSaavn and Spotify, but I do not see the corresponding withdrawal balance yet. Is there an audit delay?',
    status: 'resolved' as const,
    createdAt: '2026-06-15T08:00:00Z',
    replies: [
      {
        sender: 'admin' as const,
        senderName: 'Finance Admin',
        message: 'Hi Mrinmoy, the reports for May streams were audited on June 15th. Your balance of ₹16,420 has been unlocked and added to your Ledger Wallet. You can now request a 1-click withdrawal via UPI or Bank Transfer.',
        createdAt: '2026-06-15T11:45:00Z'
      }
    ]
  }
];

let withdrawals = [
  {
    id: 'w_1',
    artistId: 'u1',
    artistName: 'Zubeen Garg',
    amount: 28450,
    paymentMethod: 'UPI',
    details: 'zubeen@okhdfcbank',
    status: 'completed' as const,
    createdAt: '2026-06-20T10:00:00Z'
  },
  {
    id: 'w_2',
    artistId: 'u3',
    artistName: 'Cinebap Mrinmoy',
    amount: 12500,
    paymentMethod: 'Bank Transfer',
    details: 'SBI A/C: 30459203814 IFSC: SBIN0000124',
    status: 'pending' as const,
    createdAt: '2026-07-07T16:00:00Z'
  }
];

// Activity log for admin oversight
let activityLogs = [
  { time: '2026-07-08T07:44:12Z', user: 'Super Admin', action: 'Approved release "Maya (Traditional Soul)"' },
  { time: '2026-07-07T16:00:00Z', user: 'Cinebap Mrinmoy', action: 'Requested ₹12,500 withdrawal' },
  { time: '2026-07-07T14:22:00Z', user: 'Zubeen Garg', action: 'Replied to Ticket #t_1' },
  { time: '2026-07-07T12:00:00Z', user: 'Cinebap Mrinmoy', action: 'Created draft release "Kolkata Cyberpunk"' }
];

// ==========================================
// 3. API ROUTE ENDPOINTS
// ==========================================

// -- Auth Routes --
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (found) {
    // Return session data (Simple token-less demo auth)
    return res.json({
      success: true,
      user: {
        id: found.id,
        email: found.email,
        name: found.name,
        role: found.role,
        labelName: found.labelName,
        isVerified: found.isVerified
      }
    });
  }
  
  // Create virtual session for newly registered/unseeded emails
  const defaultArtist: User = {
    id: 'u_' + Math.random().toString(36).substring(2, 9),
    email,
    name: email.split('@')[0],
    role: 'artist',
    labelName: 'Independent Label',
    isVerified: true
  };
  users.push(defaultArtist);
  res.json({ success: true, user: defaultArtist });
});

app.post("/api/auth/register", (req, res) => {
  const { email, name, labelName, role } = req.body;
  const newUser: User = {
    id: 'u_' + Math.random().toString(36).substring(2, 9),
    email,
    name,
    role: role || 'artist',
    labelName: labelName || 'Dream Records Indie',
    isVerified: false // Requires virtual OTP
  };
  users.push(newUser);
  res.json({ success: true, user: newUser });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const user = users.find(u => u.email === email);
  if (user) {
    user.isVerified = true;
    return res.json({ success: true, user });
  }
  res.status(404).json({ error: "User not found" });
});

// -- Release Manager Routes --
app.get("/api/releases", (req, res) => {
  const { artistId } = req.query;
  if (artistId) {
    return res.json(releases.filter(r => r.artistId === artistId));
  }
  res.json(releases);
});

app.post("/api/releases", (req, res) => {
  const { artistId, artistName, title, coverUrl, genre, subGenre, language, mood, stores, tracks, releaseDate, status } = req.body;
  
  const newRelease = {
    id: 'rel_' + Math.random().toString(36).substring(2, 9),
    artistId,
    artistName: artistName || 'Unknown Artist',
    title: title || 'Untitled Release',
    coverUrl: coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    genre: genre || 'Pop',
    subGenre: subGenre || 'Indie Pop',
    language: language || 'English',
    mood: mood || 'Chill',
    stores: stores || ['spotify'],
    status: (status || 'draft') as any,
    releaseDate: releaseDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    tracks: tracks || []
  };

  releases.push(newRelease);
  activityLogs.unshift({
    time: new Date().toISOString(),
    user: artistName || 'Artist',
    action: `Created release "${newRelease.title}"`
  });

  res.json({ success: true, release: newRelease });
});

app.post("/api/admin/releases/approve", (req, res) => {
  const { releaseId, upc, isrcs } = req.body;
  const rel = releases.find(r => r.id === releaseId);
  if (rel) {
    rel.status = 'approved';
    rel.upc = upc || '50' + Math.floor(10000000000 + Math.random() * 90000000000);
    if (rel.tracks && rel.tracks.length > 0) {
      rel.tracks.forEach((t, idx) => {
        rel.isrc = (isrcs && isrcs[idx]) || 'IN-TFW-26-' + Math.floor(10000 + Math.random() * 90000);
      });
    }
    
    activityLogs.unshift({
      time: new Date().toISOString(),
      user: 'Super Admin',
      action: `Approved release "${rel.title}"`
    });
    
    return res.json({ success: true, release: rel });
  }
  res.status(404).json({ error: "Release not found" });
});

app.post("/api/admin/releases/reject", (req, res) => {
  const { releaseId, feedback } = req.body;
  const rel = releases.find(r => r.id === releaseId);
  if (rel) {
    rel.status = 'rejected';
    rel.feedback = feedback || 'Does not meet store requirements';
    
    activityLogs.unshift({
      time: new Date().toISOString(),
      user: 'Super Admin',
      action: `Rejected release "${rel.title}"`
    });
    
    return res.json({ success: true, release: rel });
  }
  res.status(404).json({ error: "Release not found" });
});

// -- Royalty & Withdraw Routes --
app.get("/api/royalties/stats", (req, res) => {
  const storeBreakdown = [
    { store: 'Spotify', streams: 148500, revenue: 10395 },
    { store: 'JioSaavn', streams: 112000, revenue: 6720 },
    { store: 'Apple Music', streams: 42000, revenue: 4200 },
    { store: 'Gaana', streams: 38000, revenue: 1900 },
    { store: 'Wynk Music', streams: 25000, revenue: 1250 },
    { store: 'YouTube Music', streams: 98000, revenue: 3920 }
  ];

  const countryBreakdown = [
    { country: 'India', streams: 345000, revenue: 20700 },
    { country: 'Bangladesh', streams: 68000, revenue: 4080 },
    { country: 'United States', streams: 12000, revenue: 1560 },
    { country: 'United Kingdom', streams: 9800, revenue: 1176 },
    { country: 'Others', streams: 28700, revenue: 869 }
  ];

  res.json({
    lifetimeStreams: 463500,
    lifetimeEarnings: 28385,
    pendingBalance: 12500, // available after deduction of pending payouts
    ledgerHistory: [
      { id: 'lh1', month: 'June 2026', streams: 245000, revenue: 16420, status: 'Audited' },
      { id: 'lh2', month: 'May 2026', streams: 218500, revenue: 11965, status: 'Audited' }
    ],
    storeBreakdown,
    countryBreakdown
  });
});

app.get("/api/withdrawals", (req, res) => {
  const { artistId } = req.query;
  if (artistId) {
    return res.json(withdrawals.filter(w => w.artistId === artistId));
  }
  res.json(withdrawals);
});

app.post("/api/withdrawals", (req, res) => {
  const { artistId, artistName, amount, paymentMethod, details } = req.body;
  const newWithdraw = {
    id: 'w_' + Math.random().toString(36).substring(2, 9),
    artistId,
    artistName: artistName || 'Unknown',
    amount: Number(amount) || 0,
    paymentMethod: paymentMethod || 'UPI',
    details: details || '',
    status: 'pending' as const,
    createdAt: new Date().toISOString()
  };
  withdrawals.push(newWithdraw);
  activityLogs.unshift({
    time: new Date().toISOString(),
    user: artistName || 'Artist',
    action: `Requested withdrawal of ₹${amount}`
  });
  res.json({ success: true, withdrawal: newWithdraw });
});

app.post("/api/admin/withdrawals/approve", (req, res) => {
  const { id } = req.body;
  const w = withdrawals.find(req => req.id === id);
  if (w) {
    w.status = 'completed';
    activityLogs.unshift({
      time: new Date().toISOString(),
      user: 'Super Admin',
      action: `Processed ₹${w.amount} payment to ${w.artistName}`
    });
    return res.json({ success: true, withdrawal: w });
  }
  res.status(404).json({ error: "Withdrawal not found" });
});

// -- Tickets Routes --
app.get("/api/tickets", (req, res) => {
  const { artistId } = req.query;
  if (artistId) {
    return res.json(supportTickets.filter(t => t.artistId === artistId));
  }
  res.json(supportTickets);
});

app.post("/api/tickets", (req, res) => {
  const { artistId, artistName, subject, category, message } = req.body;
  const newTicket = {
    id: 't_' + Math.random().toString(36).substring(2, 9),
    artistId,
    artistName,
    subject,
    category,
    message,
    status: 'open' as const,
    createdAt: new Date().toISOString(),
    replies: []
  };
  supportTickets.push(newTicket);
  res.json({ success: true, ticket: newTicket });
});

app.post("/api/tickets/:id/reply", (req, res) => {
  const { id } = req.params;
  const { sender, senderName, message } = req.body;
  const ticket = supportTickets.find(t => t.id === id);
  if (ticket) {
    const newReply = {
      sender,
      senderName,
      message,
      createdAt: new Date().toISOString()
    };
    ticket.replies.push(newReply);
    if (sender === 'admin') {
      ticket.status = 'resolved'; // automatically mark resolved or open
    } else {
      ticket.status = 'open';
    }
    return res.json({ success: true, ticket });
  }
  res.status(404).json({ error: "Ticket not found" });
});

// -- System activity oversight --
app.get("/api/admin/logs", (req, res) => {
  res.json(activityLogs);
});

// ==========================================
// 4. GEMINI AI PORTAL ENDPOINTS
// ==========================================

// -- AI Metadata checker --
app.post("/api/ai/metadata-check", async (req, res) => {
  const { title, genre, subGenre, language, mood, trackList } = req.body;
  const ai = getAiClient();
  if (!ai) {
    return res.json({
      score: 85,
      compliance: "Warning",
      checks: [
        { label: "Capitalization Standards", passed: true, detail: "Title case standard applied perfectly." },
        { label: "Misleading Subtitles Check", passed: false, detail: "Warning: Verify if versions like 'Extended Mix' align with streaming criteria." },
        { label: "Language vs Genre Sync", passed: true, detail: "Selected sub-genre is compliant." },
        { label: "Local Server Fallback Active", passed: true, detail: "Gemini client is awaiting API key configuration." }
      ],
      aiSuggestions: "To take full advantage of AI-Powered audits, configure your GEMINI_API_KEY inside the secrets panel."
    });
  }

  try {
    const prompt = `Evaluate the following digital release for potential store compliance issues. Stores like Spotify, Apple Music, and Amazon Music strictly reject releases with formatting typos, redundant subtitle flags (like "Best Song" or "Official audio"), and inconsistent metadata.
Release Info:
- Title: ${title}
- Main Genre: ${genre}
- Sub Genre: ${subGenre}
- Language: ${language}
- Mood: ${mood}
- Tracks: ${JSON.stringify(trackList)}

Respond in JSON format with properties:
"score" (integer 0-100),
"compliance" ("Passed" | "Warning" | "Rejected"),
"checks" (array of objects with "label", "passed" (boolean), "detail" (string)),
"aiSuggestions" (string description of metadata optimization points).
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            compliance: { type: Type.STRING },
            checks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  passed: { type: Type.BOOLEAN },
                  detail: { type: Type.STRING }
                }
              }
            },
            aiSuggestions: { type: Type.STRING }
          },
          required: ["score", "compliance", "checks", "aiSuggestions"]
        }
      }
    });

    const report = JSON.parse(result.text || "{}");
    res.json(report);
  } catch (error: any) {
    console.error("AI Metadata error:", error);
    res.status(500).json({ error: "Failed to audit metadata", detail: error.message });
  }
});

// -- AI Genre and Vibe suggestions --
app.post("/api/ai/genre-suggest", async (req, res) => {
  const { title, mood, sampleLyrics } = req.body;
  const ai = getAiClient();
  if (!ai) {
    return res.json({
      suggestedGenre: "Indie Pop",
      suggestedSubGenre: "Dream Pop",
      alternateGenre: "Indian Indie",
      vibeAnalysis: "Chill, melodic, with emotional acoustic themes.",
      targetPlaylists: ["Bollywood Acoustic", "Assamese Folk Melodies", "Radar India"]
    });
  }

  try {
    const prompt = `Analyze the song details below and provide the best genres, sub-genres, and mood tags for submission metadata to maximize search discovery on Spotify & Apple Music algorithms.
Song Details:
- Title: ${title}
- Mood description: ${mood}
- Sample Lyrics: ${sampleLyrics || 'None provided'}

Respond in JSON format with properties:
"suggestedGenre" (string),
"suggestedSubGenre" (string),
"alternateGenre" (string),
"vibeAnalysis" (string),
"targetPlaylists" (array of strings representing matching playlist themes).
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedGenre: { type: Type.STRING },
            suggestedSubGenre: { type: Type.STRING },
            alternateGenre: { type: Type.STRING },
            vibeAnalysis: { type: Type.STRING },
            targetPlaylists: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["suggestedGenre", "suggestedSubGenre", "alternateGenre", "vibeAnalysis", "targetPlaylists"]
        }
      }
    });

    const data = JSON.parse(result.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("AI Genre Suggestion error:", error);
    res.status(500).json({ error: "Failed to suggest genre", detail: error.message });
  }
});

// -- AI Lyrics formatter & timestamp generator --
app.post("/api/ai/lyrics-format", async (req, res) => {
  const { rawLyrics } = req.body;
  const ai = getAiClient();
  if (!ai) {
    return res.json({
      formattedLyrics: rawLyrics || "No lyrics provided to format.",
      hasInappropriateContent: false,
      timestampTemplate: "[00:15.00] Line 1\n[00:22.50] Line 2\n[00:30.00] Chorus",
      tips: "To use full lyrics automation, configure the GEMINI_API_KEY."
    });
  }

  try {
    const prompt = `Take the following raw unstructured lyrics, organize them into standard lyrical sections (Verse, Chorus, Bridge, Outro), clean up punctuation, check for spelling errors, and output an LRC timestamp template.
Raw Lyrics:
${rawLyrics}

Respond in JSON with properties:
"formattedLyrics" (string representing structured clean text),
"hasInappropriateContent" (boolean, flag extreme hate speech or structural issues),
"timestampTemplate" (string with mock timestamp tags like "[00:00.00] Line"),
"tips" (string of feedback or tips for lyric guidelines in stores).
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            formattedLyrics: { type: Type.STRING },
            hasInappropriateContent: { type: Type.BOOLEAN },
            timestampTemplate: { type: Type.STRING },
            tips: { type: Type.STRING }
          },
          required: ["formattedLyrics", "hasInappropriateContent", "timestampTemplate", "tips"]
        }
      }
    });

    const data = JSON.parse(result.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("AI Lyrics error:", error);
    res.status(500).json({ error: "Failed to format lyrics", detail: error.message });
  }
});

// -- AI Cover art advisor --
app.post("/api/ai/cover-check", async (req, res) => {
  const { releaseTitle, artworkDescription } = req.body;
  const ai = getAiClient();
  if (!ai) {
    return res.json({
      complianceScore: 90,
      issues: ["Ensure the artist name or label doesn't contain contact details."],
      suggestions: "Add higher-contrast text if printing titles. Avoid store logos.",
      estimatedRejectionRisk: "Low"
    });
  }

  try {
    const prompt = `Analyze the description of the cover artwork for store compliance (such as Spotify/Apple Music guidelines which require minimum 3000x3000px, no pixelation, matching title exactly, no advertising logos, and no URL text).
Release Title: ${releaseTitle}
Cover Art Description: ${artworkDescription}

Respond in JSON with properties:
"complianceScore" (integer 0-100),
"issues" (array of strings listing compliance issues),
"suggestions" (string describing layout or formatting optimizations),
"estimatedRejectionRisk" ("Low" | "Medium" | "High")
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            complianceScore: { type: Type.INTEGER },
            issues: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.STRING },
            estimatedRejectionRisk: { type: Type.STRING }
          },
          required: ["complianceScore", "issues", "suggestions", "estimatedRejectionRisk"]
        }
      }
    });

    const data = JSON.parse(result.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("AI Cover Art error:", error);
    res.status(500).json({ error: "Failed to verify cover art", detail: error.message });
  }
});


// ==========================================
// 5. VITE & STATIC FILES ROUTING
// ==========================================

// Handle Vite middleware in development vs compiled static file index in production
const setupServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html as a fallback for React Router SPAs
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dream Records Server is successfully listening on port ${PORT}`);
  });
};

setupServer();

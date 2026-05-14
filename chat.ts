import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[API CHAT] Request received');
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[API CHAT] Missing API Key');
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY belum dikonfigurasi di Vercel.',
        details: 'Pastikan kamu sudah menambahkan GEMINI_API_KEY di Project Settings > Environment Variables di dashboard Vercel.'
      });
    }

    const { messages, text, systemInstruction } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });
    
    // Format history untuk Gemini SDK
    const history = (messages || []).map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: Array.isArray(m.parts) ? m.parts : [{ text: String(m.text || "") }]
    }));

    console.log('[API CHAT] History formatted:', JSON.stringify(history));

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(text);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      return res.status(500).json({ error: 'AI mengembalikan respons kosong' });
    }

    return res.status(200).json({ text: responseText });
  } catch (error: any) {
    console.error('[API CHAT] Error:', error);
    return res.status(500).json({ 
      error: 'Gagal menghubungi AI', 
      details: error.message 
    });
  }
}

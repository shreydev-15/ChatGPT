const { GoogleGenAI } = require( "@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateResponse(contents){
    if (!Array.isArray(contents) || contents.length === 0) {
        throw new TypeError("AI message content is required");
    }

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents
    })

    const text = typeof response.text === "function"
        ? await response.text()
        : response.text;

    if (!text || !text.trim()) {
        throw new Error("Gemini returned an empty response");
    }

    return text.trim();
}

module.exports = generateResponse
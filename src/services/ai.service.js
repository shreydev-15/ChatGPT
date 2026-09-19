const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || !apiKey.trim()) {
    console.error("FATAL: GEMINI_API_KEY is not set in .env");
} else {
    console.log('Gemini API key loaded (' + apiKey.length + ' chars)');
}

const ai = new GoogleGenAI({
    apiKey: apiKey
});

// Send recent conversation history to Gemini and return its text response.
async function generateResponse(contents){
    if (!Array.isArray(contents) || contents.length === 0) {
        throw new TypeError("AI message content is required");
    }

    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash", "gemini-3.6-flash", "gemini-3.8-flash", "gemini-2.0-flash-exp", ];
    let lastError = null;

    for (const model of modelsToTry) {
        try {
            console.log(`Attempting Gemini model: ${model}`);
            const response = await ai.models.generateContent({
                model,
                contents
            });

            const text = response.text;

            if (text && text.trim()) {
                console.log(`Successfully generated response using model: ${model}`);
                return text.trim();
            }
        } catch (err) {
            console.warn(`Model ${model} failed (${err.status || err.message}). Trying fallback model...`);
            lastError = err;
        }
    }

    throw lastError || new Error("All Gemini models failed to generate a response");
}

module.exports = generateResponse
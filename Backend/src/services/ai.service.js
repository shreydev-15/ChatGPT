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

function parseGeminiError(err) {
    const raw = err?.message || String(err);
    try {
        const jsonStart = raw.indexOf("{");
        if (jsonStart !== -1) {
            const parsed = JSON.parse(raw.slice(jsonStart));
            if (parsed?.error?.message) {
                return parsed.error.message;
            }
        }
    } catch {
        /* use raw message */
    }
    return raw;
}

const PLAIN_TEXT_STYLE =
    "Reply in plain text only for a simple chat UI. Do not use markdown, asterisks, bold, italics, code fences, headings, bullet lists with symbols, or emojis. Use normal sentences; use line breaks only when helpful.";

function buildSystemInstruction(extra) {
    if (extra && extra.trim()) {
        return `${extra.trim()}\n\n${PLAIN_TEXT_STYLE}`;
    }
    return `You are a helpful assistant in a messaging app. ${PLAIN_TEXT_STYLE}`;
}

function toPlainText(text) {
    if (typeof text !== "string") return "";

    let out = text;
    out = out.replace(/```[\s\S]*?```/g, (block) =>
        block.replace(/^```[^\n]*\n?/, "").replace(/```$/, "").trim()
    );
    out = out.replace(/`([^`]+)`/g, "$1");
    out = out.replace(/\*\*([^*]+)\*\*/g, "$1");
    out = out.replace(/__([^_]+)__/g, "$1");
    out = out.replace(/\*([^*\n]+)\*/g, "$1");
    out = out.replace(/_([^_\n]+)_/g, "$1");
    out = out.replace(/^\s{0,3}#{1,6}\s+/gm, "");
    out = out.replace(/^\s*[-*+]\s+/gm, "");
    out = out.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    out = out.replace(/\*\*/g, "").replace(/__/g, "");

    return out.trim();
}

function getModelsToTry() {
    const fromEnv = process.env.GEMINI_MODEL?.trim();
    if (fromEnv) {
        return fromEnv.split(",").map((m) => m.trim()).filter(Boolean);
    }
    return [
        "gemini-3.5-flash",
        "gemini-3.6-flash",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3-flash-preview",
    ];
}

// Send recent conversation history to Gemini and return its text response.
async function generateResponse(contents, systemInstruction = null){
    if (!Array.isArray(contents) || contents.length === 0) {
        throw new TypeError("AI message content is required");
    }

    const modelsToTry = getModelsToTry();
    let lastError = null;

    for (const model of modelsToTry) {
        try {
            console.log(`Attempting Gemini model: ${model}`);
            const payload = {
                model,
                contents,
                config: {
                    systemInstruction: buildSystemInstruction(systemInstruction)
                }
            };

            const response = await ai.models.generateContent(payload);

            const text = response.text;

            if (text && text.trim()) {
                console.log(`Successfully generated response using model: ${model}`);
                return toPlainText(text);
            }
        } catch (err) {
            const detail = parseGeminiError(err);
            console.warn(`Model ${model} failed (${err.status || "error"}): ${detail}`);
            lastError = err;
        }
    }

    const message = lastError
        ? parseGeminiError(lastError)
        : "All Gemini models failed to generate a response";
    throw new Error(message);
}

async function generateVector(content){
    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: content,
        config: {
            outputDimensionality: 768
        }
    });

    return response.embeddings?.[0]?.values || response.embedding?.values || [];
}

module.exports = {
    generateResponse,
    generateVector
}
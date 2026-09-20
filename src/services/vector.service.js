const { Pinecone } = require('@pinecone-database/pinecone')
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })

const chatgptindex = pc.Index(process.env.PINECONE_INDEX_NAME)

async function createMemory({ vectors, metadata, messageId }) {
    await chatgptindex.upsert([{
        id: messageId,
        values: vectors,
        metadata
    }])
}

async function queryMemory({ queryVector, limit = 5, metadata }) {
    const data = await chatgptindex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true
    })
    return data
}

module.exports = {
    createMemory,
    queryMemory
}

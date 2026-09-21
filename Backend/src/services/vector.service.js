const { Pinecone } = require('@pinecone-database/pinecone')
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })

const chatgptindex = pc.Index(process.env.PINECONE_INDEX_NAME)

async function createMemory({ vectors, metadata, messageId }) {
    await chatgptindex.upsert({
        records: [{
            id: String(messageId),
            values: vectors,
            metadata
        }]
    })
}

async function queryMemory({ queryVector, limit = 5, metadata }) {
    const hasFilter = metadata && Object.keys(metadata).length > 0;
    const queryOptions = {
        vector: queryVector,
        topK: limit,
        includeMetadata: true
    };

    if (hasFilter) {
        queryOptions.filter = metadata;
    }

    const data = await chatgptindex.query(queryOptions);
    return data;
}

module.exports = {
    createMemory,
    queryMemory
}

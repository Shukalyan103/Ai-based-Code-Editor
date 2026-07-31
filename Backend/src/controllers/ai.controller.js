const aiService = require('../service/ai.service');

module.exports.getCodeData = async (req, res) => {
    const { code, promt } = req.body;

    if (!code || !promt) {
        return res.status(400).send('code or promt is required');
    }

    const finalpromt = `
    ${promt}

    Code:
    ${code}
    `;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    try {
        const stream = await aiService.getCodeStream(finalpromt);
        for await (const chunk of stream) {
            const content = chunk.text || "";
            if (content) {
                res.write(content);
            }
        }
    } catch (error) {
        console.error("Error in getCodeData streaming:", error);
        res.write("\n\n[Streaming Error occurred on the server]");
    } finally {
        res.end();
    }
};

module.exports.getPromtData = async (req, res) => {
    const { promt } = req.body;

    if (!promt) {
        console.log('promt is required');
        return res.status(400).send('promt is required');
    }

    const finalpromt = `
    ${promt}
    `;

    try {
        const response = await aiService.getPromtData(finalpromt);
        res.json(response);
    } catch (error) {
        console.error("Error in getPromtData:", error);
        res.status(500).send("Error generating prompt data");
    }
};
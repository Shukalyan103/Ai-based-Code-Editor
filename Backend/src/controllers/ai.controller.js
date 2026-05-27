
const aiService = require('../service/ai.service');


module.exports.getCodeData = async (req, res) => {
    const { code, promt } = req.body

    if (!code || !promt) {
        console.log('code or promt is required')
        return res.status(400).send('code or promt is required')
    }

    const finalpromt = `
    
    ${promt}

    Code:
    ${code}

   
    `




    const response = await aiService(finalpromt)
    let parse;
    try {
        parse = response.replace(/```json|```/g, " ").trim()
    } catch (e) {
        return res.status(500).send('Error parsing JSON')
    }

    res.json(parse)

}

module.exports.getPromtData = async (req, res) => {
    const { promt } = req.body

    if (!promt) {
        console.log('code or promt is required')
        return res.status(400).send('code or promt is required')
    }

    const finalpromt = `
    
    
    ${promt}

   

   
    `




    const response = await aiService(finalpromt)
    // let parse;
    // try{
    //      parse=response.replace(/```json|```/g, " ").trim()
    // }catch(e){
    //      return res.status(500).send('Error parsing JSON')
    // }

    res.json(response)

}
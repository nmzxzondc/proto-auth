import {jwtManager} from "./jwtManager";
import {ObfuscateLuau} from "./obfuscateLuau";

import express from 'express';
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('shh');
})

app.post('/api/generate', (req, res) => {


    if (!req.body) {
        res.status(400).send({})
        return;
    }

    const { hwid } = req.body;

    if (!hwid) {
        res.status(400).send({})
        return;
    }


    let new_gen = new jwtManager()
    let token = new_gen.generate("hwid")
    res.send(token)
})


app.get('/api/script', (req, res) => {
    let reqBody = req.body;
    let hwid = reqBody["hwid"]
    let authHeader = req.headers['authorization']!;

    let new_gen = new jwtManager();
    let validToken = new_gen.validate(authHeader, hwid)

    if (!authHeader || !validToken) {
        res.status(403).send('Not authorized');
    }

    let script = new ObfuscateLuau()
    script.obfuscate("test.luau")
    res.send("success")
})


app.listen(port, () => {
    console.log(`running on port http://localhost:${port}`);
    setInterval(function () {
        let script = new ObfuscateLuau()
        script.obfuscateAll()
    }, 12 * 1000);
})
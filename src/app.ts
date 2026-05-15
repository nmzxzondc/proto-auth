import {PrometheusUpdater} from "./PrometheusUpdater"
import {ObfuscateLuau} from "./obfuscateLuau";
import {keyManager} from "./KeyManager";
import path from 'node:path';

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


    let gen = new keyManager()
    let token = gen.generate_sha256(hwid) // or gen.generate_jwt(hwid)
    res.send(token)
})


app.get('/api/script', (req, res) => {
    if (!req.body) {
        res.status(400).send({})
        return;
    }

    const { hwid } = req.body;
    const { file } = req.body;
    let authHeader = req.headers['authorization']!;
    let userAgent = req.headers['user-agent']!;

    if (userAgent.includes("Mozilla")) {
        return res.status(403).send('Not authorized');
    }

    if (!file || !hwid) {
        return res.status(400).send('Bad request');
    }

    let gen = new keyManager();
    let validKey = gen.validate_sha256(authHeader, hwid) // or gen.validate_jwt(authHeader, hwid)

    if (!authHeader || !validKey) {

        return res.status(403).send('Not authorized');
    }

    res.sendFile(path.resolve("./files/" + file + ".luau.obfuscated.lua"))
})


app.listen(port, () => {
    console.log(`running on port http://localhost:${port}`);

    let updater = new PrometheusUpdater()
    let script = new ObfuscateLuau()

    updater.update().then(function() {
        setInterval(function () {
            script.obfuscateAll()
        }, 12 * 1000);
    })




})
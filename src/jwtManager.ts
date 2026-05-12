import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path: '../.env' });
const encryptionKey = process.env.ENCRYPTION_KEY!;

type payload = {
    hwid: string;
}

function encode(token: string) {
    let strBuffer = Buffer.from(token, 'utf8');
    return strBuffer.toString('base64');
}

function decode(encoded: string) {
    let strBuffer = Buffer.from(encoded, 'base64');
    return strBuffer.toString('utf8');
}

export class jwtManager {



    generate(hwid: string) {
        const payload: payload = {
            hwid: hwid,
        }

        if (!encryptionKey) {
            throw new Error('Missing ENCRYPTION_KEY environment variable');
        }

        let token = jwt.sign(payload, encryptionKey, {expiresIn: "1d"})

        if (token) {
            let encoded_token = encode(token);
            return {"token": encoded_token};
        } else {
            return -1;
        }

    }

    validate(token: string, hwid: string) {
        try {
            token = decode(token);
            let decoded_token = jwt.verify(token, encryptionKey) as payload;
            return decoded_token["hwid"] == hwid;
        } catch (error) {
            return false;
        }
    }
}
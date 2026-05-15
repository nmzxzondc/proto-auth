import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createHmac } from 'crypto'

dotenv.config({ path: '../.env' });
const encryptionKey = process.env.ENCRYPTION_KEY!;
const sha256_encryptionKey = process.env.SHA_256_ENC_KEY!;

type payload = {
    hwid: string;
}

type key_payload = {
    data: payload,
    signature: string;
}

function encode(token: string) {
    let strBuffer = Buffer.from(token, 'utf8');
    return strBuffer.toString('base64');
}

function decode(encoded: string) {
    let strBuffer = Buffer.from(encoded, 'base64');
    return strBuffer.toString('utf8');
}



export class keyManager {



    generate_jwt(hwid: string) {
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

    validate_jwt(token: string, hwid: string) {
        try {
            token = decode(token);
            let decoded_token = jwt.verify(token, encryptionKey) as payload;
            return decoded_token["hwid"] == hwid;
        } catch (error) {
            return false;
        }
    }

    generate_sha256(hwid: string) {
        const data: payload = {
            hwid: hwid,
        }

        const msg = JSON.stringify(data, null, 4);
        const signature = createHmac('sha256', sha256_encryptionKey).update(msg).digest('hex');

        const payload: key_payload = {
            data: data,
            signature: signature
        };

        const buffer = Buffer.from(JSON.stringify(payload), "utf-8");
        return buffer.toString('base64');
    }

    validate_sha256(key: string, hwid: string) {
        const buffer = Buffer.from(key, 'base64');
        const decoded_buffer = buffer.toString('utf-8');
        const decoded_payload: key_payload = JSON.parse(decoded_buffer);

        const data: payload = decoded_payload["data"]
        const signature = decoded_payload["signature"]

        const data_hwid = data["hwid"]

        const expected_data = JSON.stringify(data, null, 4);
        const expected_signature = createHmac('sha256', sha256_encryptionKey).update(expected_data).digest('hex');

        return expected_signature == signature && data_hwid == hwid;
    }
}
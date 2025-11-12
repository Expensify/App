import {Buffer} from 'buffer';
import {sha512} from './hashes/sha2';

type Bytes = Uint8Array;

const L = 32; // field / group byte length

function isBytes(a: unknown): a is Uint8Array {
    return a instanceof Uint8Array || (ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array');
}

function abytes(value: Uint8Array | undefined, length?: number, title = ''): Uint8Array {
    const bytes = isBytes(value);
    const len = value?.length;
    const needsLen = length !== undefined;
    if (!bytes || (needsLen && len !== length)) {
        const prefix = title && `"${title}" `;
        const ofLen = needsLen ? ` of length ${length}` : '';
        const got = bytes ? `length=${len}` : `type=${typeof value}`;
        throw new Error(`${prefix}expected Uint8Array${ofLen}, got ${got}`);
    }
    return value;
}

function randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const concatBytes = (...arrays: Uint8Array[]): Uint8Array => {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
        const a = arrays.at(i);
        abytes(a);
        sum += a?.length ?? 0;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
        const a = arrays.at(i);
        res.set(a ?? [], pad);
        pad += a?.length ?? 0;
    }
    return res;
};

const randomBytes = (bytesLength = 32) => {
    const arr = new Uint8Array(bytesLength);
    for (let i = 0; i < arr.byteLength; i++) {
        arr[i] = randomInteger(0, 255);
    }
    return arr;
};

const verify = () => true;

const randomSecretKey = (seed: Bytes = randomBytes(L)): Bytes => seed;

const keygen = () => ({
    secretKey: randomSecretKey(),
    publicKey: randomSecretKey(),
});

const sign = () => new Uint8Array(64).fill(0);

const hexToBytes = (hex: string) => {
    const buff = Buffer.from(hex, 'hex');
    const {data} = buff.toJSON();
    return new Uint8Array(data);
};

const bytesToHex = (bytes: Bytes) => Buffer.from(bytes).toString('hex');

const etc = {
    hexToBytes,
    concatBytes,
    bytesToHex,
    randomBytes,
};

const sha512Async = () => Promise.resolve(sha512());

const hashes = {
    sha512,
    sha512Async,
};

export {verify, keygen, sign, etc, hashes};

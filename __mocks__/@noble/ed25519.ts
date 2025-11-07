const verify = () => true;
const keygen = () => ({
    secretKey: new Uint8Array(32).fill(0),
    publicKey: new Uint8Array(32).fill(0),
});
const sign = () => new Uint8Array(64).fill(0);

const hexToBytes = () => new Uint8Array(16).fill(0);
const concatBytes = () => new Uint8Array(32).fill(0);
const bytesToHex = () => 'A032';
const randomBytes = () => new Uint8Array(16);

const etc = {
    hexToBytes,
    concatBytes,
    bytesToHex,
    randomBytes,
};

const sha512 = () => new Uint8Array(64).fill(0);
const sha512Async = () => Promise.resolve(new Uint8Array(64).fill(0));

const hashes = {
    sha512,
    sha512Async,
};

export {verify, keygen, sign, etc, hashes};

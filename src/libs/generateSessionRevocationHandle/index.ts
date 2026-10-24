/** Generates a capability for completion lookup without retaining account credentials. */
function generateSessionRevocationHandle(): Promise<string> {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Promise.resolve(Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(''));
}

export default generateSessionRevocationHandle;

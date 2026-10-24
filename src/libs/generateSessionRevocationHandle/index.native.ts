/** Uses the native secure RNG, independent of browser crypto polyfills. */
async function generateSessionRevocationHandle(): Promise<string> {
    const {randomBytes} = await import('react-native-quick-crypto');
    return randomBytes(32).toString('hex');
}

export default generateSessionRevocationHandle;

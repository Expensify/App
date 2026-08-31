import type WebCryptoProvider from './types';

/**
 * Native: unreachable. QA auth is structurally off (isQAAuthConfigured() returns false on native). A real
 * implementation must come from react-native-quick-crypto's WebCrypto surface (getRandomValues + subtle.digest).
 */
const webCrypto: WebCryptoProvider = {
    getRandomValues: (array) => array,
    sha256: () => Promise.resolve(new ArrayBuffer(0)),
};

export default webCrypto;

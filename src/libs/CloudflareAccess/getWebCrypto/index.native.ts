import type WebCryptoProvider from './types';

/**
 * Native: unimplemented while the flow is web-only. The eventual version must use react-native-quick-crypto's
 * WebCrypto surface (`getRandomValues` + `subtle.digest`), NOT its Node-style `createHash`, so the PKCE
 * helper keeps one implementation. Throwing keeps the module import-safe and accidental use loud.
 */
const webCrypto: WebCryptoProvider = {
    getRandomValues: () => {
        throw new Error('CloudflareAccess getWebCrypto is not implemented on native yet');
    },
    sha256: () => {
        throw new Error('CloudflareAccess getWebCrypto is not implemented on native yet');
    },
};

export default webCrypto;

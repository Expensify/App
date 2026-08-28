/**
 * The minimal WebCrypto surface the PKCE helper needs. Both platform implementations must satisfy
 * this contract so the PKCE logic itself stays platform-agnostic.
 */
type WebCryptoProvider = {
    /** Fills the array with cryptographically strong random values and returns it (synchronous, per spec) */
    getRandomValues: (array: Uint8Array<ArrayBuffer>) => Uint8Array<ArrayBuffer>;

    /** SHA-256 digest of the given bytes */
    sha256: (data: BufferSource) => Promise<ArrayBuffer>;
};

export default WebCryptoProvider;

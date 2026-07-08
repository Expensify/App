/**
 * Web/desktop fallback: these platforms use IndexedDB, not the native SQLite/SQLCipher storage
 * provider, so there is no plaintext database to migrate and no encryption key to pass to Onyx.
 */
export default function prepareOnyxStorage(): string | undefined {
    return undefined;
}

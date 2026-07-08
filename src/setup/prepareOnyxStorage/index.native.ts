import migrateSQLiteStorageToEncrypted from 'react-native-onyx/dist/migrateSQLiteStorageToEncrypted';

/**
 * Identifier of the SQLCipher encryption key used for the Onyx SQLite database. The key material
 * itself never passes through JavaScript: react-native-nitro-sqlite resolves (and on first use
 * generates) the actual key in the native layer, backed by the iOS Keychain / Android Keystore.
 */
const ONYX_DB_KEY_ID = 'onyx-db';

/**
 * One-time, idempotent migration of the plaintext Onyx SQLite database into the encrypted one.
 * Must run before `Onyx.init()` since passing a `keyId` to `Onyx.init()` tells it to open the
 * encrypted database — any data still sitting in the plaintext database at that point would be
 * orphaned rather than migrated.
 *
 * @returns the `keyId` to pass to `Onyx.init()`
 */
export default function prepareOnyxStorage(): string {
    migrateSQLiteStorageToEncrypted({keyId: ONYX_DB_KEY_ID});

    return ONYX_DB_KEY_ID;
}

import type {NitroSQLiteConnection} from 'react-native-nitro-sqlite';

const mockDatabase: Partial<NitroSQLiteConnection> = {
    close: () => {},
    delete: () => {},
    attach: () => {},
    detach: () => {},
    transaction: () => {
        return Promise.resolve();
    },
    executeBatch: () => {
        return {
            results: [],
            lastInsertId: 0,
            rowsAffected: 0,
        };
    },
    executeBatchAsync: () => {
        return Promise.resolve({
            results: [],
            lastInsertId: 0,
            rowsAffected: 0,
        });
    },
};

jest.mock('react-native-nitro-sqlite', () => ({
    open: () => mockDatabase,
}));

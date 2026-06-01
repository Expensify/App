import Onyx from 'react-native-onyx';
import clearOnyxAndSeedFullReconnect from '@libs/actions/clearOnyxAndSeedFullReconnect';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();

describe('actions/clearOnyxAndSeedFullReconnect', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('seeds LAST_FULL_RECONNECT_TIME with the current DB time so subscribeToFullReconnect does not fire a duplicate ReconnectApp before OpenApp successData arrives', async () => {
        await Onyx.set(ONYXKEYS.LAST_FULL_RECONNECT_TIME, null);
        await waitForBatchedUpdates();

        const before = DateUtils.getDBTime();
        await clearOnyxAndSeedFullReconnect([]);
        await waitForBatchedUpdates();

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.LAST_FULL_RECONNECT_TIME,
                callback: (value) => {
                    expect(typeof value).toBe('string');
                    expect((value ?? '').length > 0).toBe(true);
                    expect((value ?? '') >= before).toBe(true);
                    Onyx.disconnect(connection);
                    resolve();
                },
            });
        });
    });

    it('preserves keys passed in keysToPreserve and clears everything else', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {accountID: 1, authToken: 'preserved-auth-token'},
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
        });
        await waitForBatchedUpdates();

        await clearOnyxAndSeedFullReconnect([ONYXKEYS.SESSION]);
        await waitForBatchedUpdates();

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.SESSION,
                callback: (value) => {
                    expect(value?.authToken).toBe('preserved-auth-token');
                    Onyx.disconnect(connection);
                    resolve();
                },
            });
        });

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.NVP_PRIORITY_MODE,
                callback: (value) => {
                    expect(value).toBeUndefined();
                    Onyx.disconnect(connection);
                    resolve();
                },
            });
        });
    });

    it('applies extraSeeds atomically and keeps seeded keys after the clear', async () => {
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        await waitForBatchedUpdates();

        await clearOnyxAndSeedFullReconnect([], {
            [ONYXKEYS.IS_LOADING_APP]: true,
        });
        await waitForBatchedUpdates();

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.IS_LOADING_APP,
                callback: (value) => {
                    expect(value).toBe(true);
                    Onyx.disconnect(connection);
                    resolve();
                },
            });
        });

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.LAST_FULL_RECONNECT_TIME,
                callback: (value) => {
                    expect(typeof value).toBe('string');
                    expect((value ?? '').length > 0).toBe(true);
                    Onyx.disconnect(connection);
                    resolve();
                },
            });
        });
    });

    it('does not let extraSeeds override the LAST_FULL_RECONNECT_TIME seed', async () => {
        // Caller tries to override the timestamp seed with an empty string — the helper must win.
        await clearOnyxAndSeedFullReconnect([], {
            [ONYXKEYS.LAST_FULL_RECONNECT_TIME]: '',
        });
        await waitForBatchedUpdates();

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.LAST_FULL_RECONNECT_TIME,
                callback: (value) => {
                    expect(typeof value).toBe('string');
                    expect((value ?? '').length > 0).toBe(true);
                    Onyx.disconnect(connection);
                    resolve();
                },
            });
        });
    });

    it('clears keys that were not in keysToPreserve and were not seeded', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {accountID: 1, authToken: 'preserved-auth-token'},
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
            [ONYXKEYS.HAS_LOADED_APP]: true,
        });
        await waitForBatchedUpdates();

        // Preserve SESSION, seed IS_LOADING_APP, leave the rest to be cleared.
        await clearOnyxAndSeedFullReconnect([ONYXKEYS.SESSION], {
            [ONYXKEYS.IS_LOADING_APP]: true,
        });
        await waitForBatchedUpdates();

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.NVP_PRIORITY_MODE,
                callback: (value) => {
                    expect(value).toBeUndefined();
                    Onyx.disconnect(connection);
                    resolve();
                },
            });
        });

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.HAS_LOADED_APP,
                callback: (value) => {
                    expect(value).toBeUndefined();
                    Onyx.disconnect(connection);
                    resolve();
                },
            });
        });

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.SESSION,
                callback: (value) => {
                    expect(value?.authToken).toBe('preserved-auth-token');
                    Onyx.disconnect(connection);
                    resolve();
                },
            });
        });

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.IS_LOADING_APP,
                callback: (value) => {
                    expect(value).toBe(true);
                    Onyx.disconnect(connection);
                    resolve();
                },
            });
        });
    });
});

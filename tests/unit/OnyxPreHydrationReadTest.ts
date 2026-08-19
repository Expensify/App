import Log from '@libs/Log';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import ONYXKEYS from '@src/ONYXKEYS';
import type {LoginToAccountIDMapDerivedValue} from '@src/types/onyx/DerivedValues';

import Onyx from 'react-native-onyx';
import Storage from 'react-native-onyx/dist/storage';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/**
 * `src/setup/index.ts` calls `Onyx.init()` and `initOnyxDerivedValues()` in the same tick, and hydration
 * is async, so a synchronous read taken there misses keys that are on disk. The first two cases pin that
 * down; the last two cover the consequence, that the derived-value restore has to happen at the first
 * compute, once.
 *
 * `loginToAccountIDMap` is the vehicle because its single dependency gates the first compute on nothing.
 * Seeding goes through `Storage` rather than `Onyx`, which would populate the cache and remove the
 * phenomenon.
 */

const PERSISTED_LOGIN = 'persisted@example.com';
const PERSISTED_ACCOUNT_ID = 99;
const PERSISTED_LOGIN_MAP: LoginToAccountIDMapDerivedValue = {[PERSISTED_LOGIN]: PERSISTED_ACCOUNT_ID};
const PERSISTED_ACCOUNT = {primaryLogin: 'on-disk@example.com'};
const RESTORE_LOG = `Derived value for ${ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP} restored from cache`;

const observed = {
    accountReadInWindow: undefined as unknown,
    accountFromStorageInWindow: undefined as unknown,
    logsFromStartup: [] as string[],
    logsFromLaterDependencyChange: [] as string[],
};

describe('the derived value restore across the Onyx hydration boundary', () => {
    beforeAll(async () => {
        const logs: string[] = [];
        jest.spyOn(Log, 'info').mockImplementation((message: string) => {
            logs.push(message);
        });

        await Storage.setItem(ONYXKEYS.ACCOUNT, PERSISTED_ACCOUNT);
        await Storage.setItem(ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP, PERSISTED_LOGIN_MAP);

        // The order in src/setup/index.ts, reproduced: init, then derived init, same tick.
        Onyx.init({keys: ONYXKEYS});
        observed.accountReadInWindow = Onyx.get(ONYXKEYS.ACCOUNT);
        const accountFromStorage = Storage.getItem(ONYXKEYS.ACCOUNT);
        initOnyxDerivedValues();

        observed.accountFromStorageInWindow = await accountFromStorage;

        // Flush past hydration and past the first compute it triggers.
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();
        observed.logsFromStartup = [...logs];

        // A later dependency change must not restore again, or a compute after a clear would resurrect the value
        // `resetForClear` just dropped.
        logs.length = 0;
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[PERSISTED_ACCOUNT_ID]: {accountID: PERSISTED_ACCOUNT_ID, login: PERSISTED_LOGIN}});
        await waitForBatchedUpdates();
        observed.logsFromLaterDependencyChange = [...logs];
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('a synchronous read misses a value that is on disk', () => {
        expect(observed.accountReadInWindow).toBeUndefined();
        expect(observed.accountFromStorageInWindow).toEqual(PERSISTED_ACCOUNT);
    });

    it('the same read returns that value once hydration has finished', () => {
        expect(Onyx.get(ONYXKEYS.ACCOUNT)).toEqual(PERSISTED_ACCOUNT);
    });

    it('the derived value restore still happens at startup, because it is deferred to the first compute', () => {
        expect(observed.logsFromStartup).toContain(RESTORE_LOG);
    });

    it('and happens only once, not on every compute', () => {
        // Non-empty proves the dependency change did reach the engine, so the absence below is a real absence.
        expect(observed.logsFromLaterDependencyChange.length).toBeGreaterThan(0);
        expect(observed.logsFromLaterDependencyChange).not.toContain(RESTORE_LOG);
    });
});

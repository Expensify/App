import Log from '@libs/Log';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';

import Onyx from 'react-native-onyx';
import Storage from 'react-native-onyx/dist/storage';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/**
 * Validation step A7c of ONYX-GET-VALIDATION-PLAN.md.
 *
 * Two questions, both about the window between `Onyx.init()` being called and the cache being hydrated:
 * whether a synchronous read can see a value that is on disk, and whether the derived-value restore in
 * `src/libs/actions/OnyxDerived/index.ts` still works, given `src/setup/index.ts` calls `Onyx.init()` and
 * `initOnyxDerivedValues()` in the same tick with nothing awaited between them.
 *
 * Everything is seeded through `Storage` rather than `Onyx`, because writing through Onyx would populate
 * the cache and remove the phenomenon.
 */

const PERSISTED_ATTRIBUTES: ReportAttributesDerivedValue = {reports: {}, locale: 'en'};
const PERSISTED_ACCOUNT = {primaryLogin: 'on-disk@example.com'};
const RESTORE_LOG = `Derived value for ${ONYXKEYS.DERIVED.REPORT_ATTRIBUTES} restored from cache`;

const observed = {
    accountReadInWindow: undefined as unknown,
    accountFromStorageInWindow: undefined as unknown,
    logsFromColdInit: [] as string[],
    logsFromWarmInit: [] as string[],
};

describe('A7c: reads in the window between Onyx.init() and hydration', () => {
    beforeAll(async () => {
        const logs: string[] = [];
        jest.spyOn(Log, 'info').mockImplementation((message: string) => {
            logs.push(message);
        });

        await Storage.setItem(ONYXKEYS.ACCOUNT, PERSISTED_ACCOUNT);
        await Storage.setItem(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, PERSISTED_ATTRIBUTES);

        // The order in src/setup/index.ts, reproduced: init, then derived init, same tick.
        Onyx.init({keys: ONYXKEYS});
        observed.accountReadInWindow = Onyx.get(ONYXKEYS.ACCOUNT);
        const accountFromStorage = Storage.getItem(ONYXKEYS.ACCOUNT);
        initOnyxDerivedValues();

        observed.accountFromStorageInWindow = await accountFromStorage;

        // Flush past hydration and past anything chained onto it, so a restore that merely ran late would
        // still be captured here. Without this the absence below would only mean "not yet".
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();
        observed.logsFromColdInit = [...logs];

        // Counterfactual: the same restore with the value already in the cache, which is what makes the
        // assertions above statements about timing rather than about the log message.
        logs.length = 0;
        await Onyx.merge(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, PERSISTED_ATTRIBUTES);
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
        observed.logsFromWarmInit = [...logs];
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

    it('the derived value restore therefore cannot fire at startup', () => {
        // Non-empty proves `initOnyxDerivedValues` ran at all, so the absence below is a real absence.
        expect(observed.logsFromColdInit.length).toBeGreaterThan(0);
        expect(observed.logsFromColdInit).not.toContain(RESTORE_LOG);
    });

    it('and does fire when the value is in the cache, so the miss is the timing', () => {
        expect(observed.logsFromWarmInit).toContain(RESTORE_LOG);
    });
});

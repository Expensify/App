import CONST from '@src/CONST';
import {WRITE_COMMANDS} from '@src/libs/API/types';
import {updateSettlementFrequency} from '@src/libs/actions/Card';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpensifyCardSettings} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const workspaceAccountID = 22588762;
const programKey = CONST.EXPENSIFY_CARD.CARD_PROGRAM.CURRENT;
const settingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}` as const;

// The day the workspace already settles on, standing in for what the backend previously sent.
const existingSettlementDay = 10;

function getCardSettings() {
    return new Promise<OnyxEntry<ExpensifyCardSettings>>((resolve) => {
        const connection = Onyx.connect({
            key: settingsKey,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

function getMonthlySettlementDate() {
    return getCardSettings().then((settings) => settings?.[programKey]?.monthlySettlementDate);
}

/**
 * Reads the parameters of the most recent settlement-frequency request. The fetch mock accumulates calls for the whole
 * file, and parameters travel as FormData, so every value comes back as a string.
 */
function getLastSettlementFrequencyRequestParams(): Record<string, FormDataEntryValue> {
    if (!jest.isMockFunction(global.fetch)) {
        throw new Error('Expected global.fetch to be a Jest mock function.');
    }
    const calls = jest.mocked(global.fetch).mock.calls.filter(([url]) => url === `https://www.expensify.com.dev/api/${WRITE_COMMANDS.UPDATE_CARD_SETTLEMENT_FREQUENCY}?`);
    const body = calls.at(-1)?.[1]?.body;
    return body instanceof FormData ? Object.fromEntries(body) : {};
}

OnyxUpdateManager();
describe('actions/Card', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(() => {
        mockFetch.succeed();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateSettlementFrequency', () => {
        it('optimistically stores a day of the month, not a date', async () => {
            // Given a workspace that settles daily
            updateSettlementFrequency(workspaceAccountID, programKey, CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY);
            await waitForBatchedUpdates();

            // When it is switched to monthly, the optimistic value is a plain day-of-month number. Storing a `Date`
            // here is what broke the settings page: the day it holds cannot survive `new Date()` on the way back out.
            const monthlySettlementDate = await getMonthlySettlementDate();
            expect(typeof monthlySettlementDate).toBe('number');
            expect(monthlySettlementDate).toBe(new Date().getDate());
        });

        it('optimistically stores a day within the 1-31 range the settings page can render', async () => {
            updateSettlementFrequency(workspaceAccountID, programKey, CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY);
            await waitForBatchedUpdates();

            // `toMonthlySettlementDate` discards anything outside this range, so a value outside it would render no hint at all.
            const monthlySettlementDate = await getMonthlySettlementDate();
            expect(monthlySettlementDate).toBeGreaterThanOrEqual(1);
            expect(monthlySettlementDate).toBeLessThanOrEqual(31);
        });

        it('clears the settlement date when switching to daily', async () => {
            // Given a workspace that already settles monthly on the 10th
            await Onyx.merge(settingsKey, {[programKey]: {monthlySettlementDate: existingSettlementDay}});
            await waitForBatchedUpdates();

            // When it is switched to daily
            updateSettlementFrequency(workspaceAccountID, programKey, CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY, existingSettlementDay);
            await waitForBatchedUpdates();

            // Then the settlement date is cleared (merging `null` removes the key), which is what makes the page show "Daily"
            await expect(getMonthlySettlementDate()).resolves.toBeUndefined();
        });

        it('keeps the optimistic day once the request succeeds', async () => {
            updateSettlementFrequency(workspaceAccountID, programKey, CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            await expect(getMonthlySettlementDate()).resolves.toBe(new Date().getDate());
        });

        it('rolls back to the previous day of the month when the request fails', async () => {
            // Given a workspace that already settles monthly on the 10th
            await Onyx.merge(settingsKey, {[programKey]: {monthlySettlementDate: existingSettlementDay}});
            await waitForBatchedUpdates();

            // When switching to daily fails
            mockFetch.fail?.();
            updateSettlementFrequency(workspaceAccountID, programKey, CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY, existingSettlementDay);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            // Then the 10th is restored as a day of the month, so the page shows the real day again rather than a
            // rollback value that has to be guessed at by `new Date()`
            const monthlySettlementDate = await getMonthlySettlementDate();
            expect(monthlySettlementDate).toBe(existingSettlementDay);
            expect(typeof monthlySettlementDate).toBe('number');
        });

        // This documents a pre-existing rollback gap rather than intended behavior, and it predates this PR. A
        // workspace that settles daily has no previous day, so `currentFrequency` is undefined and the failure data
        // merges `{monthlySettlementDate: undefined}` — Onyx drops undefined keys instead of clearing them, so the
        // optimistic day survives a failed request and the page stays on "Monthly". Clearing it would need `null`.
        // If that is fixed, this expectation should flip to `toBeUndefined()`.
        it('leaves the optimistic day behind when a failed switch to monthly has no previous day to restore', async () => {
            mockFetch.fail?.();
            updateSettlementFrequency(workspaceAccountID, programKey, CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            await expect(getMonthlySettlementDate()).resolves.toBe(new Date().getDate());
        });

        it('asks the backend for the selected frequency', async () => {
            updateSettlementFrequency(workspaceAccountID, programKey, CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            // The workspace and the chosen frequency are sent, and the settlement day is not: the backend picks the
            // real day and sends it back, which is the whole reason the day cannot be guessed on the client.
            expect(getLastSettlementFrequencyRequestParams()).toEqual(
                expect.objectContaining({
                    policyAccountID: String(workspaceAccountID),
                    settlementFrequency: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY,
                }),
            );
            expect(getLastSettlementFrequencyRequestParams()).not.toHaveProperty('monthlySettlementDate');
        });
    });
});

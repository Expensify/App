import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import {previewExpensifyCardPartialSettlement, queueExpensifyCardForBilling} from '@src/libs/actions/Card';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@src/libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const domainAccountID = 22588762;
const manualBillingKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING}${domainAccountID}` as const;
const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainAccountID}` as const;

/**
 * Reads the parameters of the most recent settle balance request. The fetch mock accumulates calls for the whole
 * file, and parameters travel as FormData, so every value comes back as a string.
 */
function getLastSettleBalanceRequestParams(): Record<string, FormDataEntryValue> {
    if (!jest.isMockFunction(global.fetch)) {
        throw new Error('Expected global.fetch to be a Jest mock function.');
    }
    const calls = jest.mocked(global.fetch).mock.calls.filter(([url]) => url === `https://www.expensify.com.dev/api/${WRITE_COMMANDS.QUEUE_EXPENSIFY_CARD_FOR_BILLING}?`);
    const body = calls.at(-1)?.[1]?.body;
    return body instanceof FormData ? Object.fromEntries(body) : {};
}

OnyxUpdateManager();
describe('actions/Card', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        // Errors are stored already translated, so the English strings have to be loaded for the assertions below
        IntlStore.load(CONST.LOCALES.EN);
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(() => {
        mockFetch.succeed();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('queueExpensifyCardForBilling', () => {
        it('tells the backend which card program to settle', async () => {
            // Given a UK/EU workspace, whose card settings live under the GB program
            const programKey = CONST.COUNTRY.GB;

            // When the admin settles the balance
            queueExpensifyCardForBilling(domainAccountID, programKey);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            // Then the request names that program, otherwise the backend looks for a US program and rejects the request
            expect(getLastSettleBalanceRequestParams()).toEqual(
                expect.objectContaining({
                    domainAccountID: String(domainAccountID),
                    feedCountry: programKey,
                }),
            );
        });

        it('sends both amounts of a partial settlement and shows it as queued right away', async () => {
            // Given a workspace where the admin previewed 350 and was shown 400 as the rounded amount
            // When the partial settlement is confirmed
            queueExpensifyCardForBilling(domainAccountID, CONST.COUNTRY.US, {amount: 350, roundedAmount: 400});
            await waitForBatchedUpdates();

            // Then the label switches to the queued partial amount before the request lands, which hides the button
            await expect(getOnyxValue(manualBillingKey)).resolves.toEqual({type: 'partial', amount: 400, requestedAmount: 350, feedCountry: CONST.COUNTRY.US});

            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            // Then the backend gets the entered and the rounded amount, so it can refuse a stale preview
            expect(getLastSettleBalanceRequestParams()).toEqual(expect.objectContaining({amount: '350', roundedAmount: '400', feedCountry: CONST.COUNTRY.US}));
        });

        it('shows a full settlement as queued and leaves the amounts out of the request', async () => {
            // Given an admin settling the full balance
            // When it is confirmed
            queueExpensifyCardForBilling(domainAccountID, CONST.COUNTRY.US);
            await waitForBatchedUpdates();

            // Then the queued value is the same string the backend sends for a full settlement
            await expect(getOnyxValue(manualBillingKey)).resolves.toBe('true');

            await mockFetch.resume?.();
            await waitForBatchedUpdates();
            expect(getLastSettleBalanceRequestParams()).not.toHaveProperty('amount');
            expect(getLastSettleBalanceRequestParams()).not.toHaveProperty('roundedAmount');
        });

        it('brings the button back and shows an error when the backend refuses the settlement', async () => {
            // Given a backend that rejects the request, for example because the transactions changed since the preview
            mockFetch.fail?.();

            // When a partial settlement is confirmed
            queueExpensifyCardForBilling(domainAccountID, CONST.COUNTRY.US, {amount: 350, roundedAmount: 400});
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            // Then nothing is shown as queued anymore and the card settings carry the error the label displays
            await expect(getOnyxValue(manualBillingKey)).resolves.toBeFalsy();
            const cardSettings = await getOnyxValue(cardSettingsKey);
            expect(Object.values(cardSettings?.errorFields?.settleBalance ?? {}).at(0)).toBe('We couldn’t queue the settlement. Please try again.');
        });
    });

    describe('previewExpensifyCardPartialSettlement', () => {
        it('stores what the backend rounded the amount to and lets the flow continue', async () => {
            // Given a backend that rounds 350 up to 400 out of 1700 that can be settled
            mockFetch.mockAPICommand(SIDE_EFFECT_REQUEST_COMMANDS.CALCULATE_EXPENSIFY_CARD_PARTIAL_SETTLEMENT, () => ({
                jsonCode: CONST.JSON_CODE.SUCCESS,
                requestedAmount: 350,
                roundedAmount: 400,
                maximumAmount: 1700,
                transactionCount: 2,
                isAboveMaximum: false,
                isEverythingEligible: false,
            }));

            // When 350 is previewed
            const canContinue = await previewExpensifyCardPartialSettlement(domainAccountID, CONST.COUNTRY.US, 350);
            await waitForBatchedUpdates();

            // Then the confirmation page can open with the rounded amount and no loading state left behind
            expect(canContinue).toBe(true);
            await expect(getOnyxValue(ONYXKEYS.RAM_ONLY_EXPENSIFY_CARD_SETTLEMENT_PREVIEW)).resolves.toEqual(
                expect.objectContaining({
                    settlementType: CONST.EXPENSIFY_CARD.SETTLEMENT_TYPE.PARTIAL,
                    requestedAmount: 350,
                    roundedAmount: 400,
                    maximumAmount: 1700,
                    transactionCount: 2,
                    isLoading: false,
                }),
            );
        });

        it('keeps the admin on the amount page when the amount is above what can be settled', async () => {
            // Given a backend reporting that 5000 is above the 1700 that can be settled early
            mockFetch.mockAPICommand(SIDE_EFFECT_REQUEST_COMMANDS.CALCULATE_EXPENSIFY_CARD_PARTIAL_SETTLEMENT, () => ({
                jsonCode: CONST.JSON_CODE.SUCCESS,
                requestedAmount: 5000,
                roundedAmount: 0,
                maximumAmount: 1700,
                transactionCount: 0,
                isAboveMaximum: true,
                isEverythingEligible: false,
            }));

            // When 5000 is previewed
            const canContinue = await previewExpensifyCardPartialSettlement(domainAccountID, CONST.COUNTRY.US, 5000);
            await waitForBatchedUpdates();

            // Then the flow stops and the maximum is available for the error under the input
            expect(canContinue).toBe(false);
            await expect(getOnyxValue(ONYXKEYS.RAM_ONLY_EXPENSIFY_CARD_SETTLEMENT_PREVIEW)).resolves.toEqual(
                expect.objectContaining({isAboveMaximum: true, maximumAmount: 1700, isLoading: false}),
            );
        });

        it('explains a failed settlement when the backend refuses to preview', async () => {
            // Given a domain with a failed settlement outstanding, which the backend answers with 402
            mockFetch.mockAPICommand(SIDE_EFFECT_REQUEST_COMMANDS.CALCULATE_EXPENSIFY_CARD_PARTIAL_SETTLEMENT, () => ({jsonCode: CONST.JSON_CODE.PAYMENT_REQUIRED}));

            // When an amount is previewed
            const canContinue = await previewExpensifyCardPartialSettlement(domainAccountID, CONST.COUNTRY.US, 350);
            await waitForBatchedUpdates();

            // Then the flow stops with the failed settlement message rather than a generic error
            expect(canContinue).toBe(false);
            const preview = await getOnyxValue(ONYXKEYS.RAM_ONLY_EXPENSIFY_CARD_SETTLEMENT_PREVIEW);
            expect(Object.values(preview?.errors ?? {}).at(0)).toBe('You can’t settle a partial balance while a previous settlement has failed.');
        });
    });

    describe('queueExpensifyCardForBilling program', () => {
        it('lets the backend pick the program when the card settings do not identify one', async () => {
            // Given card settings with no recognizable program key
            // When the admin settles the balance
            queueExpensifyCardForBilling(domainAccountID, undefined);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            // Then no program is sent, so the backend settles whichever program is provisioned on the domain
            expect(getLastSettleBalanceRequestParams()).toEqual(expect.objectContaining({domainAccountID: String(domainAccountID)}));
            expect(getLastSettleBalanceRequestParams()).not.toHaveProperty('feedCountry');
        });
    });
});

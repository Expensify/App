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

OnyxUpdateManager();
describe('actions/Card', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        // Errors are stored already translated, so the English strings have to be loaded for the assertions below
        IntlStore.load(CONST.LOCALES.EN);
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.succeed();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('queueExpensifyCardForBilling', () => {
        it('sends both amounts of a partial settlement and shows it as queued right away', async () => {
            // Given a workspace where the admin previewed 350 and was shown 400 as the rounded amount
            // When the partial settlement is confirmed
            queueExpensifyCardForBilling(domainAccountID, CONST.COUNTRY.US, {amount: 350, roundedAmount: 400});
            await waitForBatchedUpdates();

            // Then the label switches to the queued partial amount before the request lands, which hides the button
            await expect(getOnyxValue(manualBillingKey)).resolves.toEqual({type: 'partial', amount: 400});

            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            // Then the partial command gets the entered and the rounded amount, so the backend can refuse a stale preview
            TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.QUEUE_EXPENSIFY_CARD_PARTIAL_SETTLEMENT, 0, {
                feedCountry: CONST.COUNTRY.US,
                domainAccountID,
                amount: 350,
                roundedAmount: 400,
            });
            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.QUEUE_EXPENSIFY_CARD_FOR_BILLING, 0);
        });

        it('shows a partial settlement as partial even when no card program was detected', async () => {
            // Given card settings with no recognizable program
            // When a partial settlement is confirmed
            queueExpensifyCardForBilling(domainAccountID, undefined, {amount: 350, roundedAmount: 400});
            await waitForBatchedUpdates();

            // Then the label shows the partial amount, because the request is still a partial one
            await expect(getOnyxValue(manualBillingKey)).resolves.toEqual({type: 'partial', amount: 400});
        });

        it('shows a full settlement as queued and sends it without amounts', async () => {
            // Given an admin settling the full balance
            // When it is confirmed
            queueExpensifyCardForBilling(domainAccountID, CONST.COUNTRY.US);
            await waitForBatchedUpdates();

            // Then the queued value is the same string the backend sends for a full settlement
            await expect(getOnyxValue(manualBillingKey)).resolves.toBe('true');

            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            // Then it goes through the full settlement command, which settles everything outstanding
            TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.QUEUE_EXPENSIFY_CARD_FOR_BILLING, 0, {feedCountry: CONST.COUNTRY.US, domainAccountID});
            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.QUEUE_EXPENSIFY_CARD_PARTIAL_SETTLEMENT, 0);
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
});

import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {clearMoneyRequestAmount, setMoneyRequestAmount} from '@libs/actions/IOU/MoneyRequest';

import SubmitDetailsPage from '@pages/Share/SubmitDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {signInWithTestUser, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => ({default: jest.fn(), MarkerView: jest.fn(), setAccessToken: jest.fn()}));

jest.mock('@libs/ReceiptStorage', () => ({
    __esModule: true,
    default: {
        adopt: jest.fn((uriOrPath: string) => Promise.resolve(uriOrPath)),
        toLocalUri: jest.fn((durableName: string) => durableName),
        retain: jest.fn(),
        resolve: jest.fn((source: string) => source),
    },
}));

jest.mock('@pages/Share/ShareRootPage', () => ({showErrorAlert: jest.fn()}));
jest.mock('@pages/Share/useShareFileSizeValidation', () => jest.fn());

const SHARED_REPORT_ID = 'report-share-1';
const PREVIOUS_REPORT_ID = 'report-share-0';
const POLICY_ID = 'policy-1';
const ACCOUNT_ID = 1;

function getDraft(): Promise<OnyxEntry<Transaction>> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
            callback: (value) => {
                connection.unsubscribe();
                resolve(value);
            },
        });
    });
}

/** Renders the share Submit confirmation with the real confirmation list and opens the fields behind "Show more". */
async function renderShareConfirmationAndShowMore() {
    render(
        <OnyxListItemProvider>
            <HTMLEngineProvider>
                <CurrentUserPersonalDetailsProvider>
                    <LocaleContextProvider>
                        <SubmitDetailsPage
                            route={{key: 'submit-details-test', name: SCREENS.SHARE.SUBMIT_DETAILS, params: {reportOrAccountID: SHARED_REPORT_ID}}}
                            navigation={createMock<React.ComponentProps<typeof SubmitDetailsPage>['navigation']>({})}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </HTMLEngineProvider>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(await screen.findByText(translateLocal('common.showMore')));
    await waitForBatchedUpdatesWithAct();
}

describe('SubmitDetailsPage — manually entered Scan fields', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
        await signInWithTestUser(ACCOUNT_ID, 'tester@example.com');
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SHARED_REPORT_ID}`, {
                reportID: SHARED_REPORT_ID,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: POLICY_ID,
                ownerAccountID: ACCOUNT_ID,
                type: CONST.REPORT.TYPE.CHAT,
                isOwnPolicyExpenseChat: true,
                participants: {[ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
            } as Report);
            await Onyx.merge(ONYXKEYS.SHARE_TEMP_FILE, {content: 'file://shared.jpg', mimeType: 'image/jpeg'});
            await Onyx.merge(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, new Date().toISOString());
        });
    });

    it('reveals the amount, merchant and date fields behind "Show more", all empty', async () => {
        // Given a receipt shared into the Submit flow
        // When the confirmation opens and the user taps "Show more"
        await renderShareConfirmationAndShowMore();

        // Then the three fields the in-app Scan confirmation offers are here too, and all start empty because
        // their values belong to the receipt until the user chooses to enter them.
        expect(screen.getByLabelText(translateLocal('iou.amount'))).toHaveDisplayValue('');
        expect(screen.getByLabelText(translateLocal('common.merchant'))).toHaveDisplayValue('');
        expect(screen.getByLabelText(translateLocal('common.date'))).toHaveDisplayValue('');
    });

    it('persists an entered merchant and drops the "Automatic" label from all three fields', async () => {
        // Given the revealed Scan fields, each labelled as SmartScan's to fill in
        await renderShareConfirmationAndShowMore();
        const automaticLabelCount = screen.getAllByText(translateLocal('common.automatic')).length;
        expect(automaticLabelCount).toBeGreaterThanOrEqual(3);

        // When the user enters a merchant
        fireEvent.changeText(screen.getByLabelText(translateLocal('common.merchant')), 'Starbucks');
        await waitForBatchedUpdatesWithAct();

        // Then it lands on the draft the share flow submits from, and the expense stops being a scanned one,
        // so none of the three fields reads as automatic any more.
        const draft = await getDraft();
        expect(draft?.merchant).toBe('Starbucks');
        expect(draft?.isMerchantSet).toBe(true);
        expect(screen.queryAllByText(translateLocal('common.automatic'))).toHaveLength(automaticLabelCount - 3);
    });

    // The share flow re-seeds its draft from an effect that re-runs whenever late Onyx data lands, and
    // `initMoneyRequest` rewrites `created` to today on every run. That reset was silently discarding the date the
    // user had just picked, leaving the field empty and blocking Create expense on the all-or-nothing rule.
    it('keeps a date the user picked when the policy arrives after they entered it', async () => {
        // Given a user who has entered a merchant and picked a date on the shared receipt
        await renderShareConfirmationAndShowMore();
        fireEvent.changeText(screen.getByLabelText(translateLocal('common.merchant')), 'Starbucks');
        await waitForBatchedUpdatesWithAct();
        fireEvent(screen.getByLabelText(translateLocal('common.date')), 'onInputChange', '2026-01-15');
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByLabelText(translateLocal('common.date'))).toHaveDisplayValue('2026-01-15');

        // When the workspace policy resolves afterwards, re-running the draft-seeding effect
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                id: POLICY_ID,
                name: 'Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                outputCurrency: 'USD',
                role: CONST.POLICY.ROLE.ADMIN,
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then the picked date is still there rather than being reset to today
        const draft = await getDraft();
        expect(draft?.created).toBe('2026-01-15');
        expect(draft?.isCreatedSet).toBe(true);
        expect(screen.getByLabelText(translateLocal('common.date'))).toHaveDisplayValue('2026-01-15');
    });

    it('re-seeds the destination on mount while keeping an already-entered merchant and currency', async () => {
        // Given a leftover draft the user already typed a merchant and a non-policy currency into, still pointing at
        // the chat they picked before backing out
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                id: POLICY_ID,
                name: 'Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                outputCurrency: 'USD',
                role: CONST.POLICY.ROLE.ADMIN,
            });
            await Onyx.merge<`${typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${string}`>(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {
                transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                reportID: PREVIOUS_REPORT_ID,
                amount: 1000,
                currency: 'EUR',
                merchant: 'Starbucks',
                isAmountSet: true,
                isMerchantSet: true,
            });
        });

        // When the Submit page mounts for the newly picked chat
        await renderShareConfirmationAndShowMore();

        // Then the draft follows the new destination, and neither the merchant nor the currency the user entered is
        // overwritten by the policy's output currency.
        const draft = await getDraft();
        expect(draft?.reportID).toBe(SHARED_REPORT_ID);
        expect(draft?.currency).toBe('EUR');
        expect(draft?.merchant).toBe('Starbucks');
    });

    // Clearing the amount sets `isAmountSet` back to false while the picked currency stays on the draft, so the
    // re-seeding effect used to stop feeding the currency back and swapped it for the policy's output currency —
    // the currency changed under the user just because they deleted the amount they had typed.
    it('keeps the currency the user picked when they clear the amount again', async () => {
        // Given a user on the shared receipt who picked a currency other than their workspace's and typed an amount
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                id: POLICY_ID,
                name: 'Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                outputCurrency: 'USD',
                role: CONST.POLICY.ROLE.ADMIN,
            });
        });
        await renderShareConfirmationAndShowMore();
        // This is the write both the currency picker and the amount input make.
        await act(async () => {
            setMoneyRequestAmount(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, 1000, 'EUR');
        });
        await waitForBatchedUpdatesWithAct();

        // When they delete what they typed, so the amount goes back to being SmartScan's to fill in
        await act(async () => {
            clearMoneyRequestAmount(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        });
        await waitForBatchedUpdatesWithAct();

        // Then the amount field is empty again but their currency survived instead of reverting to the policy's USD
        expect(screen.getByLabelText(translateLocal('iou.amount'))).toHaveDisplayValue('');
        const clearedDraft = await getDraft();
        expect(clearedDraft?.isAmountSet).toBe(false);
        expect(clearedDraft?.currency).toBe('EUR');

        // And a later Onyx update re-running the seeding effect still can't take it back
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {name: 'Workspace renamed'});
        });
        await waitForBatchedUpdatesWithAct();
        expect((await getDraft())?.currency).toBe('EUR');
    });
});

import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

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
        resolve: jest.fn((source: string) => source),
    },
}));

jest.mock('@pages/Share/ShareRootPage', () => ({showErrorAlert: jest.fn()}));
jest.mock('@pages/Share/useShareFileSizeValidation', () => jest.fn());

const SHARED_REPORT_ID = 'report-share-1';
const POLICY_ID = 'policy-1';
const ACCOUNT_ID = 1;

function getDraft(): Promise<OnyxEntry<Transaction>> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
            callback: (value) => {
                Onyx.disconnect(connection);
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
});

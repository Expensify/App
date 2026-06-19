import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import QuickCreationActionsBar from '@components/Navigation/QuickCreationActionsBar';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockOpenCreateReportConfirmation = jest.fn();

jest.mock('@hooks/useCreateEmptyReportConfirmation', () => () => ({
    openCreateReportConfirmation: mockOpenCreateReportConfirmation,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

jest.mock('@libs/interceptAnonymousUser', () => jest.fn((callback: () => void) => callback()));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => false);

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'user@test.com';
const MOCK_POLICY_ID = 'policy-123';

function renderComponent() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <QuickCreationActionsBar />
        </ComposeProviders>,
    );
}

describe('QuickCreationActionsBar - empty report confirmation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {
                accountID: CURRENT_USER_ACCOUNT_ID,
                email: CURRENT_USER_EMAIL,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, {
                id: MOCK_POLICY_ID,
                name: 'Test Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.ADMIN,
                isPolicyExpenseChatEnabled: true,
                pendingAction: null,
                owner: CURRENT_USER_EMAIL,
                outputCurrency: CONST.CURRENCY.USD,
            });
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, MOCK_POLICY_ID);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('opens confirmation modal when an empty report exists and confirmation is not dismissed', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}empty-report`, {
                reportID: 'empty-report',
                policyID: MOCK_POLICY_ID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                total: 0,
                nonReimbursableTotal: 0,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        const reportButton = screen.getByText(translateLocal('common.report'));
        fireEvent.press(reportButton);
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenCreateReportConfirmation).toHaveBeenCalled();
    });

    it('does not open confirmation modal when confirmation has been dismissed', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}empty-report`, {
                reportID: 'empty-report',
                policyID: MOCK_POLICY_ID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                total: 0,
                nonReimbursableTotal: 0,
            });
            await Onyx.merge(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED, true);
        });
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        const reportButton = screen.getByText(translateLocal('common.report'));
        fireEvent.press(reportButton);
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();
    });
});

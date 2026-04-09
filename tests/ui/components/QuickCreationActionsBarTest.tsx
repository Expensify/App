import {act, fireEvent, render, screen} from '@testing-library/react-native';
import {getUnixTime, subDays} from 'date-fns';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import QuickCreationActionsBar from '@components/Navigation/QuickCreationActionsBar';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import {createNewReport} from '@libs/actions/Report';
import {getDefaultReportsPageRoute} from '@libs/Navigation/helpers/getCreateReportRoute';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    getActiveRoute: jest.fn(() => 'home'),
}));

jest.mock('@libs/actions/Report', () => ({
    createNewReport: jest.fn(() => ({reportID: 'mock-report-id'})),
}));

jest.mock('@libs/interceptAnonymousUser', () => jest.fn((callback: () => void) => callback()));
jest.mock('@libs/actions/IOU', () => ({
    startMoneyRequest: jest.fn(),
    startDistanceRequest: jest.fn(),
}));
jest.mock('@libs/actions/Link', () => ({
    openOldDotLink: jest.fn(),
}));
jest.mock('@libs/openTravelDotLink', () => ({
    openTravelDotLink: jest.fn(),
}));
jest.mock('@hooks/usePolicyForMovingExpenses');
jest.mock('@hooks/useHasEmptyReportsForPolicy', () => () => false);
jest.mock('@hooks/useCreateEmptyReportConfirmation', () => () => ({
    openCreateReportConfirmation: jest.fn(),
}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => {
        switch (key) {
            case 'common.expense':
                return 'Expense';
            case 'common.report':
                return 'Report';
            case 'common.distance':
                return 'Distance';
            case 'workspace.common.travel':
                return 'Travel';
            default:
                return key;
        }
    },
}));
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => false);
jest.mock('@libs/Navigation/helpers/isHomeTopmostFullScreenRoute', () => () => true);

const mockUsePolicyForMovingExpenses = jest.mocked(usePolicyForMovingExpenses);
const mockNavigate = jest.mocked(Navigation.navigate);
const mockCreateNewReport = jest.mocked(createNewReport);

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'user@test.com';
const MOCK_POLICY_ID = 'policy-123';
const MOCK_POLICY = {
    id: MOCK_POLICY_ID,
    name: 'Test Workspace',
    type: CONST.POLICY.TYPE.TEAM,
    role: CONST.POLICY.ROLE.ADMIN,
    isPolicyExpenseChatEnabled: true,
    pendingAction: null,
    avatarURL: '',
    areInvoicesEnabled: false,
    owner: CURRENT_USER_EMAIL,
    outputCurrency: CONST.CURRENCY.USD,
};

function renderComponent() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider]}>
            <QuickCreationActionsBar />
        </ComposeProviders>,
    );
}

describe('QuickCreationActionsBar', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        mockUsePolicyForMovingExpenses.mockReturnValue({
            policyForMovingExpensesID: MOCK_POLICY_ID,
            policyForMovingExpenses: MOCK_POLICY,
            shouldSelectPolicy: false,
        });

        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {
                accountID: CURRENT_USER_ACCOUNT_ID,
                email: CURRENT_USER_EMAIL,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, MOCK_POLICY);
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

    it('opens the created report in Reports when Home quick action Report is pressed', async () => {
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('Report'));
        await waitForBatchedUpdatesWithAct();

        expect(mockCreateNewReport).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: 'mock-report-id', backTo: getDefaultReportsPageRoute()}));
    });

    it('preserves the Reports destination when Home quick action Report goes through workspace selection', async () => {
        const pastDueGracePeriod = getUnixTime(subDays(new Date(), 3));

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, {
                ...MOCK_POLICY,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy-456`, {
                ...MOCK_POLICY,
                id: 'policy-456',
                name: 'Second Workspace',
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            });
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END, pastDueGracePeriod);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 8010);
        });
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('Report'));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute(undefined, getDefaultReportsPageRoute()));
    });
});

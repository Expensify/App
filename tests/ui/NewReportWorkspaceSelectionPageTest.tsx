import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {createNewReport} from '@libs/actions/Report';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {NewReportWorkspaceSelectionNavigatorParamList} from '@libs/Navigation/types';
import NewReportWorkspaceSelectionPage from '@pages/NewReportWorkspaceSelectionPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, TodosDerivedValue, Transaction} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Report', () => ({
    createNewReport: jest.fn(() => ({reportID: 'new-report-id'})),
}));

const mockOpenCreateReportConfirmation = jest.fn();
jest.mock('@hooks/useCreateEmptyReportConfirmation', () => jest.fn(() => ({openCreateReportConfirmation: mockOpenCreateReportConfirmation})));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModal: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    getActiveRoute: jest.fn(() => ''),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => false);
jest.mock('@navigation/helpers/isRHPOnSearchMoneyRequestReportPage', () => () => false);

const mockCreateNewReport = jest.mocked(createNewReport);

const ACCOUNT_ID = 12345;
const EMAIL = 'test@example.com';
const POLICY_ID = 'policy-1';
const POLICY_NAME = 'Test Workspace';
const REPORT_ID = 'report-1';

const BASE_TODOS: TodosDerivedValue = {
    reportsToSubmit: [],
    reportsToApprove: [],
    reportsToPay: [],
    reportsToExport: [],
    transactionsByReportID: {},
};

const Stack = createPlatformStackNavigator<NewReportWorkspaceSelectionNavigatorParamList>();

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.NEW_REPORT_WORKSPACE_SELECTION.ROOT}
                            component={NewReportWorkspaceSelectionPage}
                            initialParams={{}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

async function seedBaseOnyx() {
    const policy: Partial<Policy> = {
        id: POLICY_ID,
        name: POLICY_NAME,
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        isPolicyExpenseChatEnabled: true,
        owner: EMAIL,
        employeeList: {[EMAIL]: {email: EMAIL, role: CONST.POLICY.ROLE.ADMIN}},
        pendingAction: null,
    };
    const report: Partial<Report> = {
        reportID: REPORT_ID,
        policyID: POLICY_ID,
        ownerAccountID: ACCOUNT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        total: 0,
        nonReimbursableTotal: 0,
        pendingAction: null,
    };
    await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: EMAIL});
    await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [ACCOUNT_ID]: {login: EMAIL, accountID: ACCOUNT_ID, displayName: EMAIL},
    });
    await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
}

describe('NewReportWorkspaceSelectionPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('opens the empty-report confirmation when TODOS has no transactions for the user report', async () => {
        await act(async () => {
            await seedBaseOnyx();
            await Onyx.set(ONYXKEYS.DERIVED.TODOS, BASE_TODOS);
        });
        await waitForBatchedUpdatesWithAct();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(await screen.findByText(POLICY_NAME));
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenCreateReportConfirmation).toHaveBeenCalled();
        expect(mockCreateNewReport).not.toHaveBeenCalled();
    });

    it('creates the report directly when TODOS has a live transaction for the user report', async () => {
        const transaction: Partial<Transaction> = {
            transactionID: 'txn-1',
            reportID: REPORT_ID,
            pendingAction: null,
        };
        await act(async () => {
            await seedBaseOnyx();
            await Onyx.set(ONYXKEYS.DERIVED.TODOS, {
                ...BASE_TODOS,
                transactionsByReportID: {[REPORT_ID]: [transaction as Transaction]},
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(await screen.findByText(POLICY_NAME));
        await waitForBatchedUpdatesWithAct();

        expect(mockCreateNewReport).toHaveBeenCalled();
        expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();
    });
});

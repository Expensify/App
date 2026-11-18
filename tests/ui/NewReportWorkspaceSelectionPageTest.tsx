import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';
import type useSingleExecution from '@hooks/useSingleExecution';

import {createNewReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {NewReportWorkspaceSelectionNavigatorParamList} from '@libs/Navigation/types';

import DynamicNewReportWorkspaceSelectionPage from '@pages/DynamicNewReportWorkspaceSelectionPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Report', () => ({
    createNewReport: jest.fn(() => ({reportID: 'new-report-id'})),
    openRecipientPicker: jest.fn(),
}));

const mockOpenCreateReportConfirmation = jest.fn();
jest.mock('@hooks/useCreateEmptyReportConfirmation', () => jest.fn(() => ({openCreateReportConfirmation: mockOpenCreateReportConfirmation})));
jest.mock('@hooks/useShouldFooterBeInsideList', () => jest.fn(() => false));

// Web does not use the native pressable guard, so these tests must rely on the button's loading guard.
jest.mock('@hooks/useSingleExecution', () => jest.requireActual<{default: typeof useSingleExecution}>('@hooks/useSingleExecution/index.ts'));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModal: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => false);
jest.mock('@navigation/helpers/isRHPOnSearchMoneyRequestReportPage', () => () => false);
jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: jest.fn(() => false), isBetaEnabledOrUnknown: jest.fn(() => false)}),
}));

const mockCreateNewReport = jest.mocked(createNewReport);

const ACCOUNT_ID = 12345;
const EMAIL = 'test@example.com';
const POLICY_ID = 'policy-1';
const POLICY_NAME = 'Test Workspace';
const REPORT_ID = 'report-1';

const Stack = createPlatformStackNavigator<NewReportWorkspaceSelectionNavigatorParamList>();

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.NEW_REPORT_WORKSPACE_SELECTION.DYNAMIC_ROOT}
                            component={DynamicNewReportWorkspaceSelectionPage}
                            initialParams={{}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

async function seedBaseOnyx(policyOverrides?: Partial<Policy>) {
    const policy: Partial<Policy> = {
        id: POLICY_ID,
        name: POLICY_NAME,
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        owner: EMAIL,
        employeeList: {[EMAIL]: {email: EMAIL, role: CONST.POLICY.ROLE.ADMIN}},
        pendingAction: null,
        ...policyOverrides,
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

/**
 * Selecting a workspace only stages it. The report is created when the user presses Create.
 * The two-step press keeps these tests aligned with that flow.
 */
async function selectWorkspaceAndCreate(workspaceName: string) {
    fireEvent.press(await screen.findByText(workspaceName));
    await waitForBatchedUpdatesWithAct();

    fireEvent.press(await screen.findByText('Create'));
    await waitForBatchedUpdatesWithAct();
}

describe('NewReportWorkspaceSelectionPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.mocked(useShouldFooterBeInsideList).mockReturnValue(false);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it.each([true, false])('places Create inside the scrollable list only when the footer hook returns %s', async (shouldFooterBeInsideList) => {
        // Given the shared hook decides whether the keyboard leaves room for a fixed footer.
        jest.mocked(useShouldFooterBeInsideList).mockReturnValue(shouldFooterBeInsideList);
        await act(async () => {
            await seedBaseOnyx();
        });
        await waitForBatchedUpdatesWithAct();

        // When this page renders its workspace list.
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then Create scrolls with the list only in the layout selected by the hook.
        expect(await screen.findByRole('button', {name: 'Create'})).toBeOnTheScreen();
        const createInsideList = within(screen.getByTestId('selection-list')).queryByRole('button', {name: 'Create'});
        if (shouldFooterBeInsideList) {
            expect(createInsideList).toBeOnTheScreen();
        } else {
            expect(createInsideList).not.toBeOnTheScreen();
        }
    });

    it('shows an error without creating a report until a workspace is selected and confirmed', async () => {
        // Given no workspace is selected, Create must remain available to explain the required selection.
        await act(async () => {
            await seedBaseOnyx();
        });
        await waitForBatchedUpdatesWithAct();
        renderPage();
        await waitForBatchedUpdatesWithAct();

        const createButton = await screen.findByRole('button', {name: 'Create'});
        expect(createButton).toBeEnabled();
        expect(screen.queryByText('Please select a workspace')).not.toBeOnTheScreen();

        // When Create is pressed without a selection, validation must prevent both creation paths.
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // Then the error explains the missing selection without creating a report or opening confirmation.
        expect(await screen.findByText('Please select a workspace')).toBeOnTheScreen();
        expect(mockCreateNewReport).not.toHaveBeenCalled();
        expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();
        await waitFor(() => expect(createButton).toBeEnabled());

        // When a workspace is selected, only the validation error should clear.
        fireEvent.press(await screen.findByText(POLICY_NAME));
        await waitForBatchedUpdatesWithAct();

        // Then selecting a row still requires an explicit Create press.
        expect(screen.queryByText('Please select a workspace')).not.toBeOnTheScreen();
        expect(mockCreateNewReport).not.toHaveBeenCalled();
        expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();

        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();
        expect(mockOpenCreateReportConfirmation).toHaveBeenCalled();
    });

    it('allows workspace names to wrap to two lines', async () => {
        // Given a workspace name can exceed the available row width.
        const longWorkspaceName = 'A long workspace name that needs a second line in the workspace selection page';
        await act(async () => {
            await seedBaseOnyx({name: longWorkspaceName});
        });
        await waitForBatchedUpdatesWithAct();

        // When the workspace selection page renders its rows.
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the name supports two lines instead of truncating to one.
        expect(await screen.findByText(longWorkspaceName)).toHaveProp('numberOfLines', 2);
    });

    it('creates only one report when Create is pressed twice before navigation runs', async () => {
        // Given a selected workspace can create directly, but navigation has not run yet.
        await act(async () => {
            await seedBaseOnyx();
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}txn-1`, createMock<Transaction>({transactionID: 'txn-1', reportID: REPORT_ID, pendingAction: null}));
        });
        await waitForBatchedUpdatesWithAct();
        renderPage();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(await screen.findByText(POLICY_NAME));
        await waitForBatchedUpdatesWithAct();
        const createButton = await screen.findByRole('button', {name: 'Create'});

        // When both presses arrive before React commits the loading state, only one should be accepted.
        // eslint-disable-next-line testing-library/no-unnecessary-act -- The outer act deliberately batches both presses to reproduce the race before loading commits.
        act(() => {
            fireEvent.press(createButton);
            fireEvent.press(createButton);
        });
        await waitForBatchedUpdatesWithAct();

        // Then a single report and destination are created while navigation is still queued.
        expect(mockCreateNewReport).toHaveBeenCalledTimes(1);
        expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();
    });

    it('opens confirmation once on a double press and permits retry after cancellation', async () => {
        // Given the workspace has an empty report, Create must open confirmation rather than create immediately.
        await act(async () => {
            await seedBaseOnyx();
        });
        await waitForBatchedUpdatesWithAct();
        renderPage();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(await screen.findByText(POLICY_NAME));
        await waitForBatchedUpdatesWithAct();
        const createButton = await screen.findByRole('button', {name: 'Create'});

        // When overlapping presses arrive, they should produce only one confirmation prompt.
        // eslint-disable-next-line testing-library/no-unnecessary-act -- The outer act deliberately batches both presses to reproduce the race before loading commits.
        act(() => {
            fireEvent.press(createButton);
            fireEvent.press(createButton);
        });
        await waitForBatchedUpdatesWithAct();

        // Then no report is created before confirmation.
        expect(mockOpenCreateReportConfirmation).toHaveBeenCalledTimes(1);
        expect(mockCreateNewReport).not.toHaveBeenCalled();

        // When the user cancels, the staged selection must remain usable for a fresh attempt.
        act(() => {
            jest.mocked(useCreateEmptyReportConfirmation).mock.lastCall?.[0].onCancel?.();
        });
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expect(createButton).toBeEnabled());
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // Then confirmation can reopen and its accepted result creates exactly one report.
        expect(mockOpenCreateReportConfirmation).toHaveBeenCalledTimes(2);
        act(() => {
            jest.mocked(useCreateEmptyReportConfirmation).mock.lastCall?.[0].onConfirm(false);
        });
        expect(mockCreateNewReport).toHaveBeenCalledTimes(1);
    });

    it('opens the empty-report confirmation when there are no transactions for the user report', async () => {
        await act(async () => {
            await seedBaseOnyx();
        });
        await waitForBatchedUpdatesWithAct();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await selectWorkspaceAndCreate(POLICY_NAME);

        expect(mockOpenCreateReportConfirmation).toHaveBeenCalled();
        expect(mockCreateNewReport).not.toHaveBeenCalled();
    });

    it('creates the report directly when there is a live transaction for the user report', async () => {
        const transaction = createMock<Transaction>({
            transactionID: 'txn-1',
            reportID: REPORT_ID,
            pendingAction: null,
        });
        await act(async () => {
            await seedBaseOnyx();
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        });
        await waitForBatchedUpdatesWithAct();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await selectWorkspaceAndCreate(POLICY_NAME);

        expect(mockCreateNewReport).toHaveBeenCalled();
        expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();
    });

    it('shows only group workspaces in the selector', async () => {
        await act(async () => {
            await seedBaseOnyx();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}personal-policy`, {
                id: 'personal-policy',
                name: 'Personal Workspace',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.PERSONAL,
                owner: EMAIL,
                employeeList: {[EMAIL]: {email: EMAIL, role: CONST.POLICY.ROLE.ADMIN}},
                pendingAction: null,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(await screen.findByText(POLICY_NAME)).toBeOnTheScreen();
        expect(screen.queryByText('Personal Workspace')).not.toBeOnTheScreen();
    });

    it('shows Submit workspaces in the selector', async () => {
        await act(async () => {
            await seedBaseOnyx();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}submit-policy`, {
                id: 'submit-policy',
                name: 'Submit Workspace',
                role: CONST.POLICY.ROLE.EDITOR,
                type: CONST.POLICY.TYPE.SUBMIT,
                owner: EMAIL,
                employeeList: {[EMAIL]: {email: EMAIL, role: CONST.POLICY.ROLE.EDITOR}},
                pendingAction: null,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(await screen.findByText(POLICY_NAME)).toBeOnTheScreen();
        expect(await screen.findByText('Submit Workspace')).toBeOnTheScreen();
    });
});

import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SearchActionsBarCreateButton from '@components/Search/SearchPageHeader/SearchActionsBarCreateButton';

import {createNewReport} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import {getUnixTime, subDays} from 'date-fns';
import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: jest.fn(() => false),
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

jest.mock('@hooks/usePopoverPosition', () => () => ({
    calculatePopoverPosition: jest.fn(() => Promise.resolve({horizontal: 0, vertical: 0})),
}));

const mockOpenCreateReportConfirmation = jest.fn();
jest.mock('@hooks/useCreateEmptyReportConfirmation', () => () => ({
    openCreateReportConfirmation: mockOpenCreateReportConfirmation,
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => true);

// Real usePreferredPolicy, with a switch to report the domain security group as still loading
const mockSecurityGroupLoading = {value: false};
jest.mock('@hooks/usePreferredPolicy', () => {
    const {default: actualUsePreferredPolicy} = jest.requireActual<{default: () => Record<string, unknown>}>('@hooks/usePreferredPolicy');
    return () => ({...actualUsePreferredPolicy(), ...(mockSecurityGroupLoading.value ? {isLoadingPreferredPolicy: true} : {})});
});

const mockNavigate = jest.mocked(Navigation.navigate);
const mockCreateNewReport = jest.mocked(createNewReport);
const mockInterceptAnonymousUser = jest.mocked(interceptAnonymousUser);

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'user@test.com';
const CURRENT_USER_DOMAIN = 'test.com';

const MOCK_POLICY_ID = 'policy-123';
const MOCK_POLICY = {
    id: MOCK_POLICY_ID,
    name: 'Test Workspace',
    type: CONST.POLICY.TYPE.TEAM,
    role: CONST.POLICY.ROLE.ADMIN,
    pendingAction: null,
    avatarURL: '',
    areInvoicesEnabled: false,
    owner: CURRENT_USER_EMAIL,
    outputCurrency: CONST.CURRENCY.USD,
};

function renderComponent() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <SearchActionsBarCreateButton />
        </ComposeProviders>,
    );
}

// Helper function to create mock events for PopoverMenuItem fireEvent.press
function createMockPressEvent(target: unknown) {
    return {
        nativeEvent: {},
        type: 'press',
        target,
        currentTarget: target,
    };
}

describe('SearchActionsBarCreateButton', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {
                accountID: CURRENT_USER_ACCOUNT_ID,
                email: CURRENT_USER_EMAIL,
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        mockSecurityGroupLoading.value = false;
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('should show the "Create report" menu item once workspaces and domain settings have loaded', async () => {
        // Given workspaces and the domain security group have finished loading
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // When Create button is pressed to open menu
        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // Then "Create report" option is visible
        expect(screen.getByText(translateLocal('report.newReport.createReport'))).toBeOnTheScreen();
    });

    it('should hide the "Create report" menu item while the domain security group is still loading', async () => {
        // Given the domain security group has not loaded yet, so a preferred-workspace lock would read as "not restricted"
        mockSecurityGroupLoading.value = true;

        // When component is rendered and the Create menu is opened
        renderComponent();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(translateLocal('common.create')));
        await waitForBatchedUpdatesWithAct();

        // Then "Create report" is not offered, so it can't create on the wrong workspace or silently do nothing
        expect(screen.queryByText(translateLocal('report.newReport.createReport'))).not.toBeOnTheScreen();
        expect(screen.getByText(translateLocal('iou.createExpense'))).toBeOnTheScreen();
    });

    it('should navigate to upgrade path when no valid policy exists', async () => {
        // Given the user has no report-eligible workspace in Onyx

        // When component is rendered
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // When Create button is pressed to open menu
        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // When "Create report" is pressed
        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        // Then it navigates to the upgrade path
        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('upgrade'));
    });

    it('should navigate to workspace selector when no default policy and multiple workspaces exist', async () => {
        // Given user has multiple policies (shouldSelectPolicy = true, but no single default)
        // Set up multiple eligible group workspaces
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, MOCK_POLICY);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy-456`, {
                ...MOCK_POLICY,
                id: 'policy-456',
                name: 'Second Workspace',
            });
        });
        await waitForBatchedUpdatesWithAct();

        // When component is rendered
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // When Create button is pressed to open menu
        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // When "Create report" is pressed
        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        // Then it navigates to workspace selection
        expect(mockNavigate).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.path));
    });

    it('should create report directly when a single default workspace exists', async () => {
        // Given user has a single valid policy
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, MOCK_POLICY);
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, MOCK_POLICY_ID);
        });
        await waitForBatchedUpdatesWithAct();

        // When component is rendered
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // When Create button is pressed to open menu
        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // When "Create report" is pressed
        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        // Then createNewReport is called to create the report directly
        expect(mockCreateNewReport).toHaveBeenCalled();
    });

    it('should call interceptAnonymousUser when "Create report" is pressed', async () => {
        // Given component is rendered
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // When Create button is pressed to open menu
        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // When "Create report" is pressed
        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        // Then interceptAnonymousUser is called
        expect(mockInterceptAnonymousUser).toHaveBeenCalled();
    });

    it('should also show "Create expense" and "Track distance" menu items', async () => {
        // When component is rendered
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // When Create button is pressed to open menu
        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // Then all three menu items are visible
        expect(screen.getByText(translateLocal('iou.createExpense'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('iou.trackDistance'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('report.newReport.createReport'))).toBeOnTheScreen();
    });

    it('should call startMoneyRequest when "Create expense" is pressed', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, MOCK_POLICY);
        });
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        const createExpenseItem = screen.getByText(translateLocal('iou.createExpense'));
        fireEvent.press(createExpenseItem, createMockPressEvent(createExpenseItem));
        await waitForBatchedUpdatesWithAct();

        expect(mockInterceptAnonymousUser).toHaveBeenCalled();
    });

    it('should navigate to workspace selector when owner billing is restricted and multiple workspaces exist', async () => {
        // Given the current user owns a workspace that is past due billing with an outstanding amount
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
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, MOCK_POLICY_ID);
        });
        await waitForBatchedUpdatesWithAct();

        // When component is rendered and "Create report" is pressed
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        // Then it navigates to workspace selection since there are multiple workspaces and the default is restricted
        expect(mockNavigate).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.path));
    });

    it('should open confirmation modal when an empty report exists and confirmation is not dismissed', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, MOCK_POLICY);
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, MOCK_POLICY_ID);
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

        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenCreateReportConfirmation).toHaveBeenCalled();
        expect(mockCreateNewReport).not.toHaveBeenCalled();
    });

    it('should not open confirmation modal when confirmation has been dismissed', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, MOCK_POLICY);
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, MOCK_POLICY_ID);
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

        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();
    });

    it('should navigate to restricted action page when owner billing is restricted and only one workspace exists', async () => {
        // Given the current user owns a single workspace that is past due billing with an outstanding amount
        const pastDueGracePeriod = getUnixTime(subDays(new Date(), 3));

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, {
                ...MOCK_POLICY,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            });
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END, pastDueGracePeriod);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 8010);
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, MOCK_POLICY_ID);
        });
        await waitForBatchedUpdatesWithAct();

        // When component is rendered and "Create report" is pressed
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        // Then it navigates to the restricted action page for the single restricted workspace
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute(MOCK_POLICY_ID));
    });

    it('creates the report on the domain preferred workspace without opening the selector', async () => {
        // Given a member of three workspaces whose domain security group locks them to a workspace that is not their active one
        const preferredPolicyID = 'preferred-policy';
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, MOCK_POLICY);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}other-policy`, {...MOCK_POLICY, id: 'other-policy'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${preferredPolicyID}`, {...MOCK_POLICY, id: preferredPolicyID, name: 'Preferred Workspace'});
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, MOCK_POLICY_ID);
            await Onyx.merge(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[CURRENT_USER_DOMAIN]: {securityGroupID: 'group-1', ownerAccountID: 42}});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}group-1_42`, {enableRestrictedPrimaryPolicy: true, restrictedPrimaryPolicyID: preferredPolicyID});
        });
        await waitForBatchedUpdatesWithAct();

        // When "Create report" is pressed from the Search header Create menu
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(translateLocal('common.create')));
        await waitForBatchedUpdatesWithAct();

        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        // Then the report goes to the preferred workspace, which the domain made the user's default, and no selector opens
        expect(mockCreateNewReport).toHaveBeenCalledTimes(1);
        expect(mockCreateNewReport.mock.calls.at(0)?.at(3)).toEqual(expect.objectContaining({id: preferredPolicyID}));
        expect(mockNavigate).not.toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.path));
    });
});

import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import QuickCreationActionsBar from '@components/Navigation/QuickCreationActionsBar';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';
import Onyx from 'react-native-onyx';

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

const mockCreateNewReport = jest.fn<{reportID: string}, unknown[]>(() => ({reportID: 'mock-report-id'}));
jest.mock('@libs/actions/Report', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Report'),
    createNewReport: (...args: unknown[]) => mockCreateNewReport(...args),
}));

jest.mock('@libs/openTravelDotLink', () => ({
    openTravelDotLink: jest.fn(),
    shouldOpenTravelDotLinkWeb: jest.fn(() => true),
}));

const mockShowConfirmModal = jest.fn<void, [{prompt?: string}]>();
jest.mock('@hooks/useConfirmModal', () => jest.fn().mockImplementation(() => ({showConfirmModal: mockShowConfirmModal, closeModal: jest.fn()})));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => false);

// Real usePreferredPolicy, with a switch to report the domain security group as still loading
const mockSecurityGroupLoading = {value: false};
jest.mock('@hooks/usePreferredPolicy', () => {
    const {default: actualUsePreferredPolicy} = jest.requireActual<{default: () => Record<string, unknown>}>('@hooks/usePreferredPolicy');
    return () => ({...actualUsePreferredPolicy(), ...(mockSecurityGroupLoading.value ? {isLoadingPreferredPolicy: true} : {})});
});

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'user@test.com';
const CURRENT_USER_DOMAIN = 'test.com';
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

describe('QuickCreationActionsBar - travel', () => {
    const TRAVEL_POLICY_ID = 'policy-travel-456';

    const seedTravelWorkspaces = async (defaultPolicyID: string, isTravelWorkspaceProvisioned = true) => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_EMAIL});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: CURRENT_USER_EMAIL});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, {
                id: MOCK_POLICY_ID,
                name: 'Workspace Without Travel',
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.ADMIN,
                pendingAction: null,
                owner: CURRENT_USER_EMAIL,
                outputCurrency: CONST.CURRENCY.USD,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${TRAVEL_POLICY_ID}`, {
                id: TRAVEL_POLICY_ID,
                name: 'Travel Workspace',
                type: CONST.POLICY.TYPE.CORPORATE,
                role: CONST.POLICY.ROLE.ADMIN,
                pendingAction: null,
                owner: CURRENT_USER_EMAIL,
                outputCurrency: CONST.CURRENCY.USD,
                isTravelEnabled: true,
                travelSettings: isTravelWorkspaceProvisioned
                    ? {spotnanaCompanyID: 'spotnana-company-uuid', associatedTravelDomainAccountID: 'spotnana-entity-uuid', hasAcceptedTerms: true}
                    : undefined,
            });
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, defaultPolicyID);
        });
        await waitForBatchedUpdatesWithAct();
    };

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('blocks opening travel when the default workspace has no travel', async () => {
        await seedTravelWorkspaces(MOCK_POLICY_ID);
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(translateLocal('workspace.common.travel')));
        await waitForBatchedUpdatesWithAct();

        expect(openTravelDotLink).not.toHaveBeenCalled();
        expect(mockShowConfirmModal.mock.lastCall?.[0].prompt).toContain('default workspace');
    });

    it('opens travel when the travel-enabled workspace is the default one', async () => {
        await seedTravelWorkspaces(TRAVEL_POLICY_ID);
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(translateLocal('workspace.common.travel')));
        await waitForBatchedUpdatesWithAct();

        expect(openTravelDotLink).toHaveBeenCalledWith(TRAVEL_POLICY_ID);
    });

    it('does not show travel for a workspace that is not provisioned and has a stale enabled flag', async () => {
        await seedTravelWorkspaces(TRAVEL_POLICY_ID, false);
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(translateLocal('workspace.common.travel'))).toBeNull();
    });
});

describe('QuickCreationActionsBar - button identifiers', () => {
    const TRAVEL_POLICY_ID = 'policy-travel-789';

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        // Given a travel-enabled default workspace, so that all four buttons including Travel are rendered
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_EMAIL});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: CURRENT_USER_EMAIL});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${TRAVEL_POLICY_ID}`, {
                id: TRAVEL_POLICY_ID,
                name: 'Travel Workspace',
                type: CONST.POLICY.TYPE.CORPORATE,
                role: CONST.POLICY.ROLE.ADMIN,
                pendingAction: null,
                owner: CURRENT_USER_EMAIL,
                outputCurrency: CONST.CURRENCY.USD,
                isTravelEnabled: true,
                travelSettings: {spotnanaCompanyID: 'spotnana-company-uuid', associatedTravelDomainAccountID: 'spotnana-entity-uuid', hasAcceptedTerms: true},
            });
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, TRAVEL_POLICY_ID);
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

    it('gives every button a distinct test ID so analytics tooling can tell them apart', async () => {
        // When the bar renders
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // Then each button exposes its own test ID, which becomes a distinct data-testid on web
        expect(screen.getByTestId(CONST.TEST_ID.QUICK_CREATION_ACTIONS_BAR.EXPENSE)).toBeOnTheScreen();
        expect(screen.getByTestId(CONST.TEST_ID.QUICK_CREATION_ACTIONS_BAR.REPORT)).toBeOnTheScreen();
        expect(screen.getByTestId(CONST.TEST_ID.QUICK_CREATION_ACTIONS_BAR.DISTANCE)).toBeOnTheScreen();
        expect(screen.getByTestId(CONST.TEST_ID.QUICK_CREATION_ACTIONS_BAR.BOOK_TRAVEL)).toBeOnTheScreen();
    });

    it('gives every button an accessibility label matching its visible text', async () => {
        // When the bar renders
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // Then each button has a readable name instead of an empty aria-label
        expect(screen.getByLabelText(translateLocal('common.expense'))).toBeOnTheScreen();
        expect(screen.getByLabelText(translateLocal('common.report'))).toBeOnTheScreen();
        expect(screen.getByLabelText(translateLocal('common.distance'))).toBeOnTheScreen();
        expect(screen.getByLabelText(translateLocal('workspace.common.travel'))).toBeOnTheScreen();
    });

    it('routes a press on the test-ID-targeted travel button to the travel flow', async () => {
        // When the travel button is pressed by its test ID
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId(CONST.TEST_ID.QUICK_CREATION_ACTIONS_BAR.BOOK_TRAVEL));
        await waitForBatchedUpdatesWithAct();

        // Then the existing behavior is unchanged because adding identifiers did not rewire the handlers
        expect(openTravelDotLink).toHaveBeenCalledWith(TRAVEL_POLICY_ID);
    });
});

describe('QuickCreationActionsBar - domain preferred workspace', () => {
    const PREFERRED_POLICY_ID = 'preferred-policy';
    const makeTeamPolicy = (id: string) => ({
        id,
        name: `${id} workspace`,
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.USER,
        pendingAction: null,
        owner: 'owner@test.com',
        outputCurrency: CONST.CURRENCY.USD,
    });

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        mockSecurityGroupLoading.value = false;
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('keeps the Report button in place but disabled while the domain security group is still loading', async () => {
        // Given a user with a workspace whose domain security group has not loaded yet, so a lock would read as "not restricted"
        mockSecurityGroupLoading.value = true;
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_EMAIL});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, makeTeamPolicy(MOCK_POLICY_ID));
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, MOCK_POLICY_ID);
        });
        await waitForBatchedUpdatesWithAct();

        // When the Home quick actions render
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // Then the Report button stays in the bar (no reflow) but is disabled, so a press can't create on the wrong workspace
        expect(screen.getByTestId(CONST.TEST_ID.QUICK_CREATION_ACTIONS_BAR.REPORT)).toBeDisabled();
        expect(mockCreateNewReport).not.toHaveBeenCalled();
    });

    it('creates the report on the preferred workspace without opening the selector', async () => {
        // Given a member of three workspaces whose domain security group locks them to a workspace that is not their active one
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_EMAIL});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, makeTeamPolicy(MOCK_POLICY_ID));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}other-policy`, makeTeamPolicy('other-policy'));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${PREFERRED_POLICY_ID}`, makeTeamPolicy(PREFERRED_POLICY_ID));
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, MOCK_POLICY_ID);
            await Onyx.merge(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {[CURRENT_USER_DOMAIN]: {securityGroupID: 'group-1', ownerAccountID: 42}});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_SECURITY_GROUP}group-1_42`, {enableRestrictedPrimaryPolicy: true, restrictedPrimaryPolicyID: PREFERRED_POLICY_ID});
        });
        await waitForBatchedUpdatesWithAct();

        // When the Home "Report" quick action is pressed
        renderComponent();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(translateLocal('common.report')));
        await waitForBatchedUpdatesWithAct();

        // Then the report goes to the preferred workspace, which the domain made the user's default, and no selector opens
        expect(mockCreateNewReport).toHaveBeenCalledTimes(1);
        expect(mockCreateNewReport.mock.calls.at(0)?.at(3)).toEqual(expect.objectContaining({id: PREFERRED_POLICY_ID}));
        expect(Navigation.navigate).not.toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.path));
    });
});

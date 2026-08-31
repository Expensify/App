import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import QuickCreationActionsBar from '@components/Navigation/QuickCreationActionsBar';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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

jest.mock('@libs/openTravelDotLink', () => ({
    openTravelDotLink: jest.fn(),
    shouldOpenTravelDotLinkWeb: jest.fn(() => true),
}));

const mockShowConfirmModal = jest.fn<void, [{prompt?: string}]>();
jest.mock('@hooks/useConfirmModal', () => jest.fn().mockImplementation(() => ({showConfirmModal: mockShowConfirmModal, closeModal: jest.fn()})));

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

    const seedTravelWorkspaces = async (defaultPolicyID: string) => {
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
                travelSettings: {spotnanaCompanyID: 'spotnana-company-uuid', associatedTravelDomainAccountID: 'spotnana-entity-uuid', hasAcceptedTerms: true},
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

    it('explains the wrong default workspace instead of opening travel for another workspace', async () => {
        await seedTravelWorkspaces(MOCK_POLICY_ID);
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(translateLocal('workspace.common.travel')));
        await waitForBatchedUpdatesWithAct();

        expect(mockShowConfirmModal.mock.lastCall?.[0].prompt).toBe(translateLocal('travel.defaultWorkspaceTravelDisabled.message'));
        expect(openTravelDotLink).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('sends the user to set up travel on their default workspace rather than on another workspace', async () => {
        const DEFAULT_POLICY_AWAITING_SETUP_ID = 'policy-awaiting-setup-789';
        await seedTravelWorkspaces(MOCK_POLICY_ID);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${DEFAULT_POLICY_AWAITING_SETUP_ID}`, {
                id: DEFAULT_POLICY_AWAITING_SETUP_ID,
                name: 'Workspace Awaiting Travel Setup',
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.ADMIN,
                pendingAction: null,
                owner: CURRENT_USER_EMAIL,
                outputCurrency: CONST.CURRENCY.USD,
                isTravelEnabled: true,
            });
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, DEFAULT_POLICY_AWAITING_SETUP_ID);
        });
        await waitForBatchedUpdatesWithAct();
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(translateLocal('workspace.common.travel')));
        await waitForBatchedUpdatesWithAct();

        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(openTravelDotLink).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TRAVEL_MY_TRIPS.getRoute(DEFAULT_POLICY_AWAITING_SETUP_ID));
    });

    it('opens travel when the default workspace is set up for travel', async () => {
        await seedTravelWorkspaces(TRAVEL_POLICY_ID);
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(translateLocal('workspace.common.travel')));
        await waitForBatchedUpdatesWithAct();

        expect(openTravelDotLink).toHaveBeenCalledWith(TRAVEL_POLICY_ID);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });
});

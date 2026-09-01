import {act, fireEvent, render, screen} from '@testing-library/react-native';

import BookTravelButton from '@components/BookTravelButton';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {cleanupTravelProvisioningSession, setTravelProvisioningNextStep} from '@libs/actions/Travel';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'testPolicy123';
const DEFAULT_POLICY_ID = 'defaultPolicy456';
const DEFAULT_POLICY_NAME = 'Default Workspace';
const ADMIN_EMAIL = 'admin@company.com';
const USER_LOGIN = 'user@company.com';
const ENABLE_TRAVEL_ROUTE = ROUTES.TRAVEL_ENABLE.getRoute(POLICY_ID);

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        goBack: jest.fn(),
    },
}));

jest.mock('@libs/actions/Travel', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Travel');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        cleanupTravelProvisioningSession: jest.fn(),
        requestTravelAccess: jest.fn(),
        setTravelProvisioningNextStep: jest.fn(),
    };
});

const mockShowConfirmModal = jest.fn<void, [{prompt?: string}]>();
jest.mock('@hooks/useConfirmModal', () => jest.fn().mockImplementation(() => ({showConfirmModal: mockShowConfirmModal, closeModal: jest.fn()})));

jest.mock('@libs/openTravelDotLink', () => ({
    openTravelDotLink: jest.fn(),
    shouldOpenTravelDotLinkWeb: jest.fn(() => true),
}));

jest.mock('@hooks/useEnvironment', () => ({
    __esModule: true,
    default: () => ({environmentURL: 'https://dev.new.expensify.com', environment: 'development', isProduction: false, isDevelopment: true}),
}));

// A paid group workspace that already has a Spotnana company (provisioned) but has not accepted terms yet
const provisionedPolicy: Policy = {
    ...createRandomPolicy(123, CONST.POLICY.TYPE.CORPORATE),
    id: POLICY_ID,
    name: 'Travel Workspace',
    role: CONST.POLICY.ROLE.ADMIN,
    owner: ADMIN_EMAIL,
    pendingAction: null,
    employeeList: {
        [ADMIN_EMAIL]: {role: CONST.POLICY.ROLE.ADMIN},
    },
    travelSettings: {
        spotnanaCompanyID: 'spotnana-company-uuid',
        associatedTravelDomainAccountID: 'spotnana-entity-uuid',
        hasAcceptedTerms: false,
    },
};

const travelEnabledPolicy: Policy = {
    ...provisionedPolicy,
    isTravelEnabled: true,
    travelSettings: {
        spotnanaCompanyID: 'spotnana-company-uuid',
        associatedTravelDomainAccountID: 'spotnana-entity-uuid',
        hasAcceptedTerms: true,
    },
};

const workspaceWithoutTravel: Policy = {
    ...createRandomPolicy(456, CONST.POLICY.TYPE.CORPORATE),
    id: DEFAULT_POLICY_ID,
    name: DEFAULT_POLICY_NAME,
    role: CONST.POLICY.ROLE.ADMIN,
    owner: ADMIN_EMAIL,
    pendingAction: null,
    employeeList: {
        [ADMIN_EMAIL]: {role: CONST.POLICY.ROLE.ADMIN},
    },
    travelSettings: undefined,
};

const renderBookTravelButton = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <BookTravelButton
                text="Book a trip"
                activePolicyID={POLICY_ID}
            />
        </ComposeProviders>,
    );

const seedOnyx = async (isValidated: boolean) => {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, provisionedPolicy);
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: isValidated, primaryLogin: USER_LOGIN});
        await Onyx.merge(ONYXKEYS.NVP_TRAVEL_SETTINGS, {hasAcceptedTerms: false});
        await Onyx.merge(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {legalFirstName: 'Test', legalLastName: 'User'});
        await waitForBatchedUpdatesWithAct();
    });
};

describe('BookTravelButton', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('when the workspace is provisioned but terms are not yet accepted', () => {
        it('navigates a validated admin straight to the enablement stepper', async () => {
            // Given a provisioned, terms-not-accepted workspace and a validated admin
            await seedOnyx(true);
            renderBookTravelButton();
            await waitForBatchedUpdatesWithAct();

            // When the admin presses the book travel button
            fireEvent.press(screen.getByText('Book a trip'));
            await waitForBatchedUpdatesWithAct();

            // Then it routes to the enablement stepper, which computes the steps this workspace still needs
            expect(Navigation.navigate).toHaveBeenCalledWith(ENABLE_TRAVEL_ROUTE);
            expect(cleanupTravelProvisioningSession).toHaveBeenCalled();
        });

        it('routes an unvalidated admin to verify their account first, deferring the stepper until after validation', async () => {
            // Given a provisioned, terms-not-accepted workspace and an admin who has not validated their account
            await seedOnyx(false);
            renderBookTravelButton();
            await waitForBatchedUpdatesWithAct();

            // When the admin presses the book travel button
            fireEvent.press(screen.getByText('Book a trip'));
            await waitForBatchedUpdatesWithAct();

            // Then it routes to verify-account instead of the stepper directly, recording the stepper as where to
            // forward-navigate back to once validated (this avoids a URL blink from double-navigating through the
            // stepper, which would otherwise immediately redirect to this same verify-account page anyway)
            expect(setTravelProvisioningNextStep).toHaveBeenCalledWith(ENABLE_TRAVEL_ROUTE);
            expect(Navigation.navigate).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.TRAVEL_VERIFY_ACCOUNT.getRoute(POLICY_ID)));
            expect(Navigation.navigate).not.toHaveBeenCalledWith(ENABLE_TRAVEL_ROUTE);
        });
    });

    describe('when the workspace being booked with is not the default workspace', () => {
        const seedWorkspaces = async (bookingPolicy: Policy, defaultPolicyID: string, defaultPolicy: Policy = workspaceWithoutTravel) => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, bookingPolicy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${DEFAULT_POLICY_ID}`, defaultPolicy);
                await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, defaultPolicyID);
                await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, primaryLogin: USER_LOGIN});
                await Onyx.merge(ONYXKEYS.NVP_TRAVEL_SETTINGS, {hasAcceptedTerms: false});
                await Onyx.merge(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {legalFirstName: 'Test', legalLastName: 'User'});
                await waitForBatchedUpdatesWithAct();
            });
        };

        it('asks the user to switch defaults instead of opening a travel session they have no profile for', async () => {
            await seedWorkspaces(travelEnabledPolicy, DEFAULT_POLICY_ID);
            renderBookTravelButton();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText('Book a trip'));
            await waitForBatchedUpdatesWithAct();

            expect(mockShowConfirmModal).toHaveBeenCalled();
            expect(mockShowConfirmModal.mock.lastCall?.[0].prompt).toContain('default workspace');
            expect(openTravelDotLink).not.toHaveBeenCalled();
        });

        it('opens Expensify Travel when the travel-enabled workspace is the default one', async () => {
            await seedWorkspaces(travelEnabledPolicy, POLICY_ID);
            renderBookTravelButton();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText('Book a trip'));
            await waitForBatchedUpdatesWithAct();

            expect(openTravelDotLink).toHaveBeenCalledWith(POLICY_ID);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('asks the user to switch defaults when the default workspace accepted travel terms but has travel switched off', async () => {
            await seedWorkspaces(travelEnabledPolicy, DEFAULT_POLICY_ID, {...travelEnabledPolicy, id: DEFAULT_POLICY_ID, isTravelEnabled: false});
            renderBookTravelButton();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText('Book a trip'));
            await waitForBatchedUpdatesWithAct();

            expect(mockShowConfirmModal).toHaveBeenCalled();
            expect(openTravelDotLink).not.toHaveBeenCalled();
        });

        it('still lets an admin enable travel on a workspace while their default workspace has no travel', async () => {
            await seedWorkspaces(provisionedPolicy, DEFAULT_POLICY_ID);
            renderBookTravelButton();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText('Book a trip'));
            await waitForBatchedUpdatesWithAct();

            expect(Navigation.navigate).toHaveBeenCalledWith(ENABLE_TRAVEL_ROUTE);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });
    });

    describe('when the user has a personal-email login', () => {
        it('shows the public-domain error before the missing legal-name step even when legal details are missing', async () => {
            // Given a user logged in with a public-domain email and no legal name set yet
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, provisionedPolicy);
                await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, primaryLogin: 'user@gmail.com'});
                await Onyx.merge(ONYXKEYS.NVP_TRAVEL_SETTINGS, {hasAcceptedTerms: false});
                await waitForBatchedUpdatesWithAct();
            });
            renderBookTravelButton();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText('Book a trip'));
            await waitForBatchedUpdatesWithAct();

            // Then they are routed to the public-domain error, not the missing legal-name page
            expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining('public-domain-error'));
            expect(Navigation.navigate).not.toHaveBeenCalledWith(expect.stringContaining('missing-personal-details'));
        });
    });
});

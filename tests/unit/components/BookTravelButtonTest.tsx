import {act, fireEvent, render, screen} from '@testing-library/react-native';

import BookTravelButton from '@components/BookTravelButton';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {cleanupTravelProvisioningSession} from '@libs/actions/Travel';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'testPolicy123';
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
    };
});

jest.mock('@hooks/useConfirmModal', () => jest.fn().mockImplementation(() => ({showConfirmModal: jest.fn(), closeModal: jest.fn()})));

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

        it('also navigates an unvalidated admin to the enablement stepper, deferring OTP verification to the stepper itself', async () => {
            // Given a provisioned, terms-not-accepted workspace and an admin who has not validated their account
            await seedOnyx(false);
            renderBookTravelButton();
            await waitForBatchedUpdatesWithAct();

            // When the admin presses the book travel button
            fireEvent.press(screen.getByText('Book a trip'));
            await waitForBatchedUpdatesWithAct();

            // Then it still routes to the enablement stepper; the stepper's own verify-account step handles OTP
            expect(Navigation.navigate).toHaveBeenCalledWith(ENABLE_TRAVEL_ROUTE);
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

            // When the user presses the book travel button
            fireEvent.press(screen.getByText('Book a trip'));
            await waitForBatchedUpdatesWithAct();

            // Then they are routed to the public-domain error, not the missing legal-name page
            expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining('public-domain-error'));
            expect(Navigation.navigate).not.toHaveBeenCalledWith(expect.stringContaining('missing-personal-details'));
        });
    });
});

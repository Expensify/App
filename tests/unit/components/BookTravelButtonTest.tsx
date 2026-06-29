import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import BookTravelButton from '@components/BookTravelButton';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {setTravelProvisioningNextStep} from '@libs/actions/Travel';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'testPolicy123';
const ADMIN_EMAIL = 'admin@company.com';
const USER_LOGIN = 'user@company.com';
const TCS_ROUTE = `terms/${CONST.TRAVEL.DEFAULT_DOMAIN}/accept/${POLICY_ID}`;

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
        setTravelProvisioningNextStep: jest.fn(),
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
        it('navigates a validated admin straight to the Travel terms screen using the default domain', async () => {
            // Given a provisioned, terms-not-accepted workspace and a validated admin
            await seedOnyx(true);
            renderBookTravelButton();
            await waitForBatchedUpdatesWithAct();

            // When the admin presses the book travel button
            fireEvent.press(screen.getByText('Book a trip'));
            await waitForBatchedUpdatesWithAct();

            // Then it routes directly to the terms-and-conditions screen with the default domain sentinel
            expect(Navigation.navigate).toHaveBeenCalledWith(TCS_ROUTE);
            // And it does not dead-end through the verify-account hop that previously produced a not-found page
            expect(Navigation.navigate).not.toHaveBeenCalledWith(expect.stringContaining('verify-account'));
            expect(setTravelProvisioningNextStep).not.toHaveBeenCalled();
        });

        it('validates an unvalidated admin first, storing the terms screen as the next step', async () => {
            // Given a provisioned, terms-not-accepted workspace and an admin who has not validated their account
            await seedOnyx(false);
            renderBookTravelButton();
            await waitForBatchedUpdatesWithAct();

            // When the admin presses the book travel button
            fireEvent.press(screen.getByText('Book a trip'));
            await waitForBatchedUpdatesWithAct();

            // Then the terms screen is stored as the post-validation destination
            expect(setTravelProvisioningNextStep).toHaveBeenCalledWith(TCS_ROUTE);
            // And the admin is sent to verify their account first
            expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining('travel/verify-account'));
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

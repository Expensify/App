/** Covers the travel benefit composition and the footer-only travel states with real buttons. */
import {act, fireEvent, render, screen, within} from '@testing-library/react-native';

import PendingTravel from '@assets/images/pending-travel.svg';
import EmptyStateTravel from '@assets/images/product-illustrations/emptystate__travel.svg';
import PiggyBank from '@assets/images/simple-illustrations/simple-illustration__piggybank.svg';
import TravelAlerts from '@assets/images/simple-illustrations/simple-illustration__travelalerts.svg';

import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import Accessibility from '@libs/Accessibility';
import {requestTravelAccess} from '@libs/actions/Travel';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';

import ManageTrips from '@pages/Travel/ManageTrips';
import GetStartedTravel from '@pages/workspace/travel/GetStartedTravel';
import ReviewingRequest from '@pages/workspace/travel/ReviewingRequest';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {PropsWithChildren, ReactElement} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {Linking, StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'travelBenefitsPolicy';
const ACCOUNT_ID = 123;
const USER_LOGIN = 'admin@company.com';
const PRESS_EVENT = {nativeEvent: {}};
const currentUser = {accountID: ACCOUNT_ID, login: USER_LOGIN};
const mockIllustrations = {PendingTravel, EmptyStateTravel, PiggyBank, TravelAlerts};
const mockShowConfirmModal = jest.fn();
const mockOpenURL = jest.fn<Promise<void>, [url: string]>();

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => mockIllustrations,
}));

jest.mock('@hooks/useConfirmModal', () => ({__esModule: true, default: () => ({showConfirmModal: mockShowConfirmModal})}));
jest.mock('@hooks/useEnvironment', () => ({
    __esModule: true,
    default: () => ({environment: 'development', environmentURL: 'https://dev.new.expensify.com', isDevelopment: true, isProduction: false}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn(), getActiveRoute: jest.fn(() => ''), getActiveRouteWithoutParams: jest.fn(() => '')},
}));
jest.mock('@libs/actions/Travel', () => ({requestTravelAccess: jest.fn(() => Promise.resolve(true)), cleanupTravelProvisioningSession: jest.fn()}));
jest.mock('@libs/openTravelDotLink', () => ({openTravelDotLink: jest.fn()}));

// The animation player and workspace access chrome do not render the benefit rows or footer actions.
jest.mock('@components/Lottie', () => () => null);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);

function renderTravelPage(page: ReactElement) {
    return render(
        <NavigationContainer>
            <ThemeProvider theme={CONST.THEME.LIGHT}>
                <ThemeStylesProvider>
                    <CurrentUserPersonalDetailsContext.Provider value={currentUser}>
                        <LocaleContextProvider>{page}</LocaleContextProvider>
                    </CurrentUserPersonalDetailsContext.Provider>
                </ThemeStylesProvider>
            </ThemeProvider>
        </NavigationContainer>,
    );
}

function expectEmptyBenefits() {
    expect(screen.UNSAFE_queryAllByType(MenuItem.Root)).toHaveLength(0);
    expect(screen.UNSAFE_queryAllByType(Icon)).toHaveLength(0);
    const benefitsContainer = screen.UNSAFE_root.find((node) => {
        const style: unknown = StyleSheet.flatten(node.props.style);
        return typeof node.type === 'string' && !!style && typeof style === 'object' && 'rowGap' in style && style.rowGap === 16;
    });
    expect(benefitsContainer).toHaveStyle({paddingVertical: 16, paddingLeft: 4});
    expect(benefitsContainer.children).toHaveLength(0);
}

describe('travel benefit composition', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        jest.spyOn(Accessibility, 'useReducedMotion').mockReturnValue(false);
        mockOpenURL.mockResolvedValue(undefined);
        jest.spyOn(Linking, 'openURL').mockImplementation(mockOpenURL);
        const policy: Policy = {
            ...createRandomPolicy(ACCOUNT_ID, CONST.POLICY.TYPE.CORPORATE),
            id: POLICY_ID,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: USER_LOGIN,
            employeeList: {[USER_LOGIN]: {role: CONST.POLICY.ROLE.ADMIN}},
            outputCurrency: CONST.CURRENCY.USD,
            isFromFullPolicy: true,
            pendingAction: null,
            isTravelEnabled: true,
            travelSettings: {spotnanaCompanyID: 'travel-company', hasAcceptedTerms: true},
        };
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await IntlStore.load(CONST.LOCALES.EN);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
            await Onyx.set(ONYXKEYS.ACCOUNT, {validated: true, primaryLogin: USER_LOGIN});
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
        jest.restoreAllMocks();
    });

    it.each([false, true])('retains the ManageTrips benefits and footer actions with reduced motion %p', async (reducedMotion) => {
        // Given a bookable workspace, for both the animated and reduced-motion header paths
        jest.mocked(Accessibility.useReducedMotion).mockReturnValue(reducedMotion);

        // When the actual ManageTrips caller renders the travel benefits
        renderTravelPage(<ManageTrips policyID={POLICY_ID} />);
        const saveMoney = translateLocal('travel.features.saveMoney');
        const alerts = translateLocal('travel.features.alerts');
        await screen.findByLabelText(saveMoney);

        // Then the two illustrations remain attached to their translated labels and are not booking actions
        expect(screen.UNSAFE_getAllByType(Icon).map((icon): unknown => icon.props.src)).toEqual([PiggyBank, TravelAlerts]);
        expect(within(screen.getByLabelText(saveMoney)).UNSAFE_getByType(Icon).props.src).toBe(PiggyBank);
        expect(within(screen.getByLabelText(alerts)).UNSAFE_getByType(Icon).props.src).toBe(TravelAlerts);
        expect(screen.getByText(translateLocal('travel.title'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('travel.subtitle'))).toBeOnTheScreen();
        if (reducedMotion) {
            expect(screen.UNSAFE_getAllByType(ImageSVG).at(0)?.props.src).toBe(EmptyStateTravel);
            expect(screen.UNSAFE_queryAllByType(Lottie)).toHaveLength(0);
        } else {
            expect(screen.UNSAFE_getByType(Lottie).props.source).toBe(LottieAnimations.TripsEmptyState);
        }
        fireEvent.press(screen.getByLabelText(saveMoney), PRESS_EVENT);
        expect(mockOpenURL).not.toHaveBeenCalled();
        expect(openTravelDotLink).not.toHaveBeenCalled();

        // When the reader deliberately uses each footer action
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: translateLocal('travel.bookDemo')}), PRESS_EVENT);
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: translateLocal('travel.bookTravel')}), PRESS_EVENT);

        // Then demo and booking keep their distinct destinations and the active workspace reaches booking
        expect(screen.getAllByRole(CONST.ROLE.BUTTON)).toHaveLength(2);
        expect(mockOpenURL).toHaveBeenCalledTimes(1);
        expect(mockOpenURL).toHaveBeenCalledWith(CONST.BOOK_TRAVEL_DEMO_URL);
        expect(openTravelDotLink).toHaveBeenCalledTimes(1);
        expect(openTravelDotLink).toHaveBeenCalledWith(POLICY_ID);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('keeps the writable GetStartedTravel footer without creating benefit rows or an extra CTA', async () => {
        // Given a workspace that still needs travel access, whose footer intentionally skips the verification modal
        jest.mocked(requestTravelAccess).mockResolvedValueOnce(false);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {isTravelEnabled: false, travelSettings: null});
        });

        // When the real empty caller renders its BookTravelButton footer
        renderTravelPage(
            <GetStartedTravel
                policyID={POLICY_ID}
                canWriteTravelFeature
                showReadOnlyModal={jest.fn()}
            />,
        );
        const footer = await screen.findByRole(CONST.ROLE.BUTTON, {name: translateLocal('travel.bookTravel')});
        fireEvent.press(footer, PRESS_EVENT);
        await waitForBatchedUpdatesWithAct();

        // Then the introductory section and empty benefit spacing remain, with only the working footer action
        expectEmptyBenefits();
        expect(screen.getByText(translateLocal('workspace.moreFeatures.travel.getStarted.title'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('workspace.moreFeatures.travel.getStarted.subtitle'))).toBeOnTheScreen();
        expect(screen.UNSAFE_getByType(ImageSVG).props.src).toBe(PendingTravel);
        expect(screen.getAllByRole(CONST.ROLE.BUTTON)).toHaveLength(1);
        expect(requestTravelAccess).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('keeps the read-only GetStartedTravel footer connected to its permission explanation', () => {
        // Given a reader who may inspect travel but cannot enable it
        const showReadOnlyModal = jest.fn();

        // When that reader chooses the real footer button
        renderTravelPage(
            <GetStartedTravel
                policyID={POLICY_ID}
                canWriteTravelFeature={false}
                showReadOnlyModal={showReadOnlyModal}
            />,
        );
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: translateLocal('travel.bookTravel')}), PRESS_EVENT);

        // Then the empty benefit area is unchanged and the permission callback, not booking, runs
        expectEmptyBenefits();
        expect(showReadOnlyModal).toHaveBeenCalledTimes(1);
        expect(openTravelDotLink).not.toHaveBeenCalled();
        expect(requestTravelAccess).not.toHaveBeenCalled();
    });

    it('keeps ReviewingRequest as an empty benefit section with a disabled status footer', () => {
        // Given a pending travel request whose footer is status rather than another setup action
        // When the real reviewing caller renders without benefit children
        renderTravelPage(<ReviewingRequest />);

        // Then the section and empty spacing remain, and the sole footer still communicates its disabled state
        expectEmptyBenefits();
        expect(screen.getByText(translateLocal('workspace.moreFeatures.travel.reviewingRequest.title'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('workspace.moreFeatures.travel.reviewingRequest.subtitle'))).toBeOnTheScreen();
        expect(screen.UNSAFE_getByType(ImageSVG).props.src).toBe(PendingTravel);
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: translateLocal('workspace.moreFeatures.travel.reviewingRequest.ctaText')})).toBeDisabled();
        expect(screen.getAllByRole(CONST.ROLE.BUTTON)).toHaveLength(1);
    });
});

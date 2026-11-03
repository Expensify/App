import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import WiseOnboardingStatusPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseOnboardingStatusPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const BANK_ACCOUNT_ID = 9053192;
const PRIMARY_BUTTON_TEST_ID = 'confirmation-primary-button';

type StatusPageStatus = ValueOf<typeof CONST.WISE.ONBOARDING_STATUS_PAGE>;

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/9053192'));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

async function renderPage(status: StatusPageStatus | undefined) {
    await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.WISE_REIMBURSEMENTS]);
    await Onyx.set(ONYXKEYS.IS_LOADING_PAYMENT_METHODS, false);
    await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[BANK_ACCOUNT_ID]: {bankCurrency: CONST.CURRENCY.USD, bankCountry: CONST.COUNTRY.US}});
    render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ONBOARDING_STATUS}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ONBOARDING_STATUS}
                        component={WiseOnboardingStatusPage}
                        initialParams={{bankAccountID: String(BANK_ACCOUNT_ID), status}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('WiseOnboardingStatusPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it.each([
        ['review', CONST.WISE.ONBOARDING_STATUS_PAGE.REVIEW],
        ['missing', undefined],
    ])('shows the in review content when the status param is %s', async (_, status) => {
        // Given a link with the review status, or with no status, which means the admin just submitted
        // When the page opens
        await renderPage(status);

        // Then the in review content shows, with a way to reach Concierge
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.title')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.heading')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.chatWithConcierge')).toBeOnTheScreen();
    });

    it('shows the approved content when the status param is approved', async () => {
        // Given a link with the approved status
        // When the page opens
        await renderPage(CONST.WISE.ONBOARDING_STATUS_PAGE.APPROVED);

        // Then the approved content shows
        expect(screen.getByText('walletPage.wiseOnboarding.approved.title')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.approved.heading')).toBeOnTheScreen();
    });

    it('shows the rejected content when the status param is rejected', async () => {
        // Given a link with the rejected status
        // When the page opens
        await renderPage(CONST.WISE.ONBOARDING_STATUS_PAGE.REJECTED);

        // Then the rejected content shows, with a way to reach Concierge for the reason
        expect(screen.getByText('walletPage.wiseOnboarding.rejected.title')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.rejected.heading')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.chatWithConcierge')).toBeOnTheScreen();
    });

    it.each([CONST.WISE.ONBOARDING_STATUS_PAGE.REVIEW, CONST.WISE.ONBOARDING_STATUS_PAGE.REJECTED])('opens Concierge from the %s content', async (status) => {
        // Given the page shows content that points the admin to Concierge
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        await renderPage(status);

        // When the user presses Chat with Concierge
        fireEvent.press(screen.getByText('walletPage.wiseOnboarding.inReview.chatWithConcierge'));

        // Then the Concierge chat opens, since it carries the review updates and the rejection reason
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.CONCIERGE);
        navigateSpy.mockRestore();
    });

    it.each(Object.values(CONST.WISE.ONBOARDING_STATUS_PAGE))('closes the flow on the primary button when the status param is %s', async (status) => {
        // Given the page opened over the intro, which Wallet opened
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage(status);

        // When the user presses Done, or Got it on the rejected content
        fireEvent.press(screen.getByTestId(PRIMARY_BUTTON_TEST_ID));

        // Then the user lands on Wallet, the screen that opened the flow, since nothing is left to do in it
        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
        goBackSpy.mockRestore();
    });

    it('goes back to the screen the flow started from', async () => {
        // Given the page opened over the intro, which Wallet opened
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage(CONST.WISE.ONBOARDING_STATUS_PAGE.REVIEW);

        // When the user presses the back button
        fireEvent.press(screen.getByLabelText('common.back'));

        // Then the user leaves the intro too rather than reopening the form, since our part of the flow is done
        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
        goBackSpy.mockRestore();
    });
});

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

import getOnyxValue from '../../../../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const BANK_ACCOUNT_ID = 9053192;
const PRIMARY_BUTTON_TEST_ID = 'confirmation-primary-button';

type OnboardingStatus = ValueOf<typeof CONST.WISE.ONBOARDING_STATUS>;

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/9053192'));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

async function renderPage(onboardingStatus: OnboardingStatus | undefined, kycReviewFormStatus?: string) {
    await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.WISE_REIMBURSEMENTS]);
    await Onyx.set(ONYXKEYS.IS_LOADING_PAYMENT_METHODS, false);
    await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
        [BANK_ACCOUNT_ID]: {
            bankCurrency: CONST.CURRENCY.USD,
            bankCountry: CONST.COUNTRY.US,
            accountData: {bankAccountID: BANK_ACCOUNT_ID, additionalData: onboardingStatus ? {wise: {status: onboardingStatus}} : undefined},
        },
    });
    render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ONBOARDING_STATUS}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ONBOARDING_STATUS}
                        component={WiseOnboardingStatusPage}
                        initialParams={{bankAccountID: String(BANK_ACCOUNT_ID), status: kycReviewFormStatus}}
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
        jest.restoreAllMocks();
        await Onyx.clear();
    });

    it.each([CONST.WISE.ONBOARDING_STATUS.IN_REVIEW, undefined])('shows the in review content when the onboarding status is %s', async (onboardingStatus) => {
        // Given Wise reviews the business, or the account has no status yet
        // When the page opens
        await renderPage(onboardingStatus);

        // Then the in review content shows, with a way to reach Concierge
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.title')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.heading')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.chatWithConcierge')).toBeOnTheScreen();
    });

    it('shows the approved content when Wise approved the business', async () => {
        // Given the account holds Wise's approval
        // When the page opens
        await renderPage(CONST.WISE.ONBOARDING_STATUS.APPROVED);

        // Then the approved content shows
        expect(screen.getByText('walletPage.wiseOnboarding.approved.title')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.approved.heading')).toBeOnTheScreen();
    });

    it('shows the rejected content when Wise rejected the business', async () => {
        // Given the account holds Wise's rejection
        // When the page opens
        await renderPage(CONST.WISE.ONBOARDING_STATUS.NOT_APPROVED);

        // Then the rejected content shows, with a way to reach Concierge for the reason
        expect(screen.getByText('walletPage.wiseOnboarding.rejected.title')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.rejected.heading')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.chatWithConcierge')).toBeOnTheScreen();
    });

    it('moves the onboarding to review and drops the param when Wise returns after a finished form', async () => {
        // Given Wise asked for more info, and its form ended with success and sent the user back here
        const setParamsSpy = jest.spyOn(Navigation, 'setParams').mockImplementation(() => {});
        await renderPage(CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED, 'success');

        // When the page applies the form's outcome
        await waitForBatchedUpdatesWithAct();

        // Then the account shows in review until the server sends Wise's result, and the param leaves the URL so a reload does not apply it again
        const bankAccountList = await getOnyxValue(ONYXKEYS.BANK_ACCOUNT_LIST);
        expect(bankAccountList?.[BANK_ACCOUNT_ID]?.accountData?.additionalData?.wise?.status).toBe(CONST.WISE.ONBOARDING_STATUS.IN_REVIEW);
        expect(setParamsSpy).toHaveBeenCalledWith({status: undefined});
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.heading')).toBeOnTheScreen();
    });

    it.each(['failed', 'closed'])('goes back to "More info needed" when Wise returns after a form that ended as %s', async (kycReviewFormStatus) => {
        // Given Wise asked for more info
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

        // When Wise sends the user back here after the form ended without success
        await renderPage(CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED, kycReviewFormStatus);

        // Then the page that opens the form replaces this one, so the user can try again, and the status stays as it was
        expect(navigateSpy).toHaveBeenCalledWith('settings/wallet/global-reimbursements/9053192/more-info-needed', {forceReplace: true});
        const bankAccountList = await getOnyxValue(ONYXKEYS.BANK_ACCOUNT_LIST);
        expect(bankAccountList?.[BANK_ACCOUNT_ID]?.accountData?.additionalData?.wise?.status).toBe(CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED);
    });

    it.each([CONST.WISE.ONBOARDING_STATUS.IN_REVIEW, CONST.WISE.ONBOARDING_STATUS.NOT_APPROVED])('opens Concierge from the %s content', async (onboardingStatus) => {
        // Given the page shows content that points the admin to Concierge
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        await renderPage(onboardingStatus);

        // When the user presses Chat with Concierge
        fireEvent.press(screen.getByText('walletPage.wiseOnboarding.inReview.chatWithConcierge'));

        // Then the Concierge chat opens, since it carries the review updates and the rejection reason
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.CONCIERGE);
    });

    it.each([CONST.WISE.ONBOARDING_STATUS.IN_REVIEW, CONST.WISE.ONBOARDING_STATUS.APPROVED, CONST.WISE.ONBOARDING_STATUS.NOT_APPROVED])(
        'closes the flow on the primary button when the onboarding status is %s',
        async (onboardingStatus) => {
            // Given the page opened over the intro, which Wallet opened
            const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
            await renderPage(onboardingStatus);

            // When the user presses Done, or Got it on the rejected content
            fireEvent.press(screen.getByTestId(PRIMARY_BUTTON_TEST_ID));

            // Then the user lands on Wallet, the screen that opened the flow, since nothing is left to do in it
            expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
        },
    );

    it('goes back to the screen the flow started from', async () => {
        // Given the page opened over the intro, which Wallet opened
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage(CONST.WISE.ONBOARDING_STATUS.IN_REVIEW);

        // When the user presses the back button
        fireEvent.press(screen.getByLabelText('common.back'));

        // Then the user leaves the intro too rather than reopening the form, since our part of the flow is done
        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
    });
});

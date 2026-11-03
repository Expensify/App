import {act, fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {READ_COMMANDS} from '@libs/API/types';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {setHasRadio} from '@libs/NetworkState';
import openExternalLink from '@libs/openExternalLink';

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
import * as TestHelper from '../../../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const BANK_ACCOUNT_ID = 9053192;
const OTHER_BANK_ACCOUNT_ID = 1234567;
const PRIMARY_BUTTON_TEST_ID = 'confirmation-primary-button';
const KYC_REVIEW_URL = 'https://sandbox.transferwise.tech/embedded-flows/kyc-review?token=abc';

type OnboardingStatus = ValueOf<typeof CONST.WISE.ONBOARDING_STATUS>;

jest.mock('@libs/openExternalLink', () => jest.fn());
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/9053192'));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function getBankAccount(status: OnboardingStatus | undefined) {
    return {bankCurrency: CONST.CURRENCY.USD, bankCountry: CONST.COUNTRY.US, accountData: {additionalData: {wise: {status}}}};
}

async function setStatus(status: OnboardingStatus | undefined) {
    await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {[BANK_ACCOUNT_ID]: getBankAccount(status)});
    await waitForBatchedUpdatesWithAct();
}

async function renderPage(status: OnboardingStatus | undefined) {
    await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.WISE_REIMBURSEMENTS]);
    await Onyx.set(ONYXKEYS.IS_LOADING_PAYMENT_METHODS, false);
    await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[BANK_ACCOUNT_ID]: getBankAccount(status)});
    render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ONBOARDING_STATUS}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ONBOARDING_STATUS}
                        component={WiseOnboardingStatusPage}
                        initialParams={{bankAccountID: String(BANK_ACCOUNT_ID)}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

let mockFetch: ReturnType<typeof TestHelper.getGlobalFetchMock>;
let originalFetch: typeof global.fetch;

function mockKYCReviewLinkResponse() {
    mockFetch.mockAPICommand(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, () => ({
        onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, value: {url: KYC_REVIEW_URL}}],
    }));
}

async function pressContinue() {
    fireEvent.press(screen.getByTestId(PRIMARY_BUTTON_TEST_ID));
    await waitForBatchedUpdatesWithAct();
}

async function resumeFetch() {
    await act(async () => {
        await mockFetch.resume();
    });
    await waitForBatchedUpdatesWithAct();
}

describe('WiseOnboardingStatusPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        originalFetch = global.fetch;
        mockFetch = TestHelper.getGlobalFetchMock();
        global.fetch = mockFetch;
    });

    afterEach(async () => {
        // A test that fails while fetch is paused would otherwise leave its request hanging into the next test
        await resumeFetch();
        global.fetch = originalFetch;
    });

    describe('more info needed', () => {
        it('drops a link left from an earlier visit when the page opens', async () => {
            // Given a link that came back after an earlier visit closed and its cleanup already ran
            await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {url: KYC_REVIEW_URL, isLoading: false});

            // When the page opens for an account Wise needs more info about
            await renderPage(CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED);

            // Then the old link is gone, since it carries a token
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toBeUndefined();

            // When the user presses Continue and the fresh link has not arrived yet
            mockFetch.pause();
            await pressContinue();

            // Then nothing redirects, so the user never lands on the old link
            expect(openExternalLink).not.toHaveBeenCalled();
        });

        it("fetches the link for the bank account on Continue and redirects to Wise's form once it arrives", async () => {
            // Given an account Wise needs more info about, and a server that answers with a link
            mockKYCReviewLinkResponse();
            mockFetch.pause();
            await renderPage(CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED);

            // When the user presses Continue
            await pressContinue();

            // Then the link is fetched for the bank account from the route, since Wise's form is tied to it, and Continue spins until it arrives
            TestHelper.expectAPICommandToHaveBeenCalledWith(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, 0, {bankAccountID: BANK_ACCOUNT_ID});
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toEqual({isLoading: true});
            expect(openExternalLink).not.toHaveBeenCalled();

            // When the server answers
            await resumeFetch();

            // Then the user leaves for Wise's form in the same tab
            expect(openExternalLink).toHaveBeenCalledWith(KYC_REVIEW_URL, undefined, true);
        });

        it('shows an error above Continue when the link cannot be fetched', async () => {
            // Given a server that rejects the request
            mockFetch.mockAPICommand(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, () => ({jsonCode: CONST.JSON_CODE.EXP_ERROR}));
            await renderPage(CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED);

            // When the user presses Continue
            await pressContinue();

            // Then the error shows, Continue stops spinning so the user can retry, and nothing redirects
            expect(screen.getByText(TestHelper.translateLocal('common.genericErrorMessage'))).toBeOnTheScreen();
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toEqual(expect.objectContaining({isLoading: false}));
            expect(openExternalLink).not.toHaveBeenCalled();
        });

        it('clears the stuck loading state when the connection comes back', async () => {
            // Given the user pressed Continue and the connection dropped before the response, so no failureData resets isLoading
            mockFetch.pause();
            await renderPage(CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED);
            await pressContinue();
            act(() => {
                setHasRadio(false);
            });
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toEqual({isLoading: true});

            try {
                // When the connection comes back
                act(() => {
                    setHasRadio(true);
                });
                await waitForBatchedUpdatesWithAct();

                // Then the link state is cleared, so Continue stops spinning and can be pressed again
                expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toBeUndefined();
            } finally {
                // Network state is module-level, so restore it even if an assertion fails
                setHasRadio(true);
            }
        });

        it('goes back to the screen the flow started from', async () => {
            // Given the page opened over the intro, which Wallet opened
            const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
            await renderPage(CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED);

            // When the user presses the back button
            fireEvent.press(screen.getByLabelText('common.back'));

            // Then the user leaves the intro too rather than reopening the form, since our part of the flow is done
            expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
            goBackSpy.mockRestore();
        });
    });

    it.each([
        ['in review', CONST.WISE.ONBOARDING_STATUS.IN_REVIEW],
        ['not approved', CONST.WISE.ONBOARDING_STATUS.NOT_APPROVED],
        ['missing', undefined],
    ])('shows the in review content when the status is %s', async (_, status) => {
        // Given an account whose status is not a decision the admin can act on here: a rejection is explained by Concierge, and a missing one is still pending
        // When the page opens
        await renderPage(status);

        // Then the in review content shows, with a way to reach Concierge
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.title')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.heading')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.chatWithConcierge')).toBeOnTheScreen();
    });

    it('opens Concierge from the in review content', async () => {
        // Given an account Wise is reviewing
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        await renderPage(CONST.WISE.ONBOARDING_STATUS.IN_REVIEW);

        // When the user presses Chat with Concierge
        fireEvent.press(screen.getByText('walletPage.wiseOnboarding.inReview.chatWithConcierge'));

        // Then the Concierge chat opens, since it carries the review updates
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.CONCIERGE);
        navigateSpy.mockRestore();
    });

    it.each([
        ['in review', CONST.WISE.ONBOARDING_STATUS.IN_REVIEW],
        ['approved', CONST.WISE.ONBOARDING_STATUS.APPROVED],
    ])('closes the flow on Done when the status is %s', async (_, status) => {
        // Given the page opened over the intro, which Wallet opened
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage(status);

        // When the user presses Done
        fireEvent.press(screen.getByTestId(PRIMARY_BUTTON_TEST_ID));

        // Then the user lands on Wallet, the screen that opened the flow, since nothing is left to do in it
        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
        goBackSpy.mockRestore();
    });

    it('shows the approved content when Wise approved the account', async () => {
        // Given an account Wise approved
        // When the page opens
        await renderPage(CONST.WISE.ONBOARDING_STATUS.APPROVED);

        // Then the approved content shows
        expect(screen.getByText('walletPage.wiseOnboarding.approved.title')).toBeOnTheScreen();
        expect(screen.getByText('walletPage.wiseOnboarding.approved.heading')).toBeOnTheScreen();
    });

    it('switches the content when the status changes while the page is open', async () => {
        // Given the page shows the in review content
        await renderPage(CONST.WISE.ONBOARDING_STATUS.IN_REVIEW);
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.heading')).toBeOnTheScreen();

        // When Wise asks for more info while the page is open
        await setStatus(CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED);

        // Then the page follows the account's current status instead of the one it opened with
        expect(screen.getByText('walletPage.wiseOnboarding.moreInfoNeeded.title')).toBeOnTheScreen();
        expect(screen.queryByText('walletPage.wiseOnboarding.inReview.heading')).not.toBeOnTheScreen();
    });

    it("ignores another bank account's status", async () => {
        // Given the page shows the in review content for the routed account
        await renderPage(CONST.WISE.ONBOARDING_STATUS.IN_REVIEW);

        // When Wise approves another account
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {[OTHER_BANK_ACCOUNT_ID]: getBankAccount(CONST.WISE.ONBOARDING_STATUS.APPROVED)});
        await waitForBatchedUpdatesWithAct();

        // Then the page keeps showing the routed account's status
        expect(screen.getByText('walletPage.wiseOnboarding.inReview.heading')).toBeOnTheScreen();
        expect(screen.queryByText('walletPage.wiseOnboarding.approved.heading')).not.toBeOnTheScreen();
    });
});

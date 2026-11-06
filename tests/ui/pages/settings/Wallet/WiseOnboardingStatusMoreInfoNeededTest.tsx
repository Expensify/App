import {act, fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useDynamicBackPath from '@hooks/useDynamicBackPath';

import {READ_COMMANDS} from '@libs/API/types';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {setHasRadio} from '@libs/NetworkState';
import openWiseKYCReview from '@libs/openWiseKYCReview';

import WiseOnboardingStatusPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseOnboardingStatusPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../../../../utils/getOnyxValue';
import * as TestHelper from '../../../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';
import {mockKYCReviewLinkResponse} from '../../../../utils/WiseTestUtils';

const BANK_ACCOUNT_ID = 9053192;
const CONTINUE_BUTTON_TEST_ID = 'confirmation-primary-button';
const KYC_REVIEW_URL = 'https://sandbox.transferwise.tech/embedded-flows/kyc-review?token=abc';
const WALLET_INTRO_PATH = createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(BANK_ACCOUNT_ID), ROUTES.SETTINGS_WALLET);

jest.mock('@libs/openWiseKYCReview', () => ({...jest.requireActual<Record<string, unknown>>('@libs/openWiseKYCReview'), __esModule: true, default: jest.fn()}));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/9053192'));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

async function renderPage() {
    await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.WISE_REIMBURSEMENTS]);
    await Onyx.set(ONYXKEYS.IS_LOADING_PAYMENT_METHODS, false);
    await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
        [BANK_ACCOUNT_ID]: {accountData: {bankAccountID: BANK_ACCOUNT_ID, additionalData: {wise: {status: CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED}}}},
    });
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

async function pressContinue() {
    fireEvent.press(screen.getByTestId(CONTINUE_BUTTON_TEST_ID));
    await waitForBatchedUpdatesWithAct();
}

async function resumeFetch() {
    await act(async () => {
        await mockFetch.resume();
    });
    await waitForBatchedUpdatesWithAct();
}

describe('WiseOnboardingStatusPage while Wise needs more info', () => {
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

    it('drops a link left from an earlier visit when the page opens', async () => {
        // Given a link that came back after an earlier visit closed and its cleanup already ran
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {url: KYC_REVIEW_URL, isLoading: false});

        // When the page opens
        await renderPage();

        // Then the old link is gone, since it carries a token
        expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toBeUndefined();

        // When the user presses Continue and the fresh link has not arrived yet
        mockFetch.pause();
        await pressContinue();

        // Then nothing redirects, so the user never lands on the old link
        expect(openWiseKYCReview).not.toHaveBeenCalled();
    });

    it("fetches the link for the bank account on Continue and redirects to Wise's form once it arrives", async () => {
        // Given the page opened for a bank account Wise needs more info about, and a server that answers with a link
        mockKYCReviewLinkResponse(mockFetch, KYC_REVIEW_URL);
        mockFetch.pause();
        await renderPage();

        // When the user presses Continue
        await pressContinue();

        // Then the link is fetched for the bank account from the route, since Wise's form is tied to it, with the status page as the place Wise returns to, and Continue spins until it arrives
        TestHelper.expectAPICommandToHaveBeenCalledWith(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, 0, {
            bankAccountID: BANK_ACCOUNT_ID,
            redirectURL: 'https://new.expensify.com/settings/wallet/global-reimbursements/9053192/status',
        });
        expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toEqual({isLoading: true});
        expect(openWiseKYCReview).not.toHaveBeenCalled();

        // When the server answers
        await resumeFetch();

        // Then Wise's form opens with the link, over the status page
        expect(openWiseKYCReview).toHaveBeenCalledWith(KYC_REVIEW_URL, 'settings/wallet/global-reimbursements/9053192/status');
    });

    it("sends Wise the status page's path without the entry screen's query, which can hold personal data", async () => {
        // Given the flow opened over a Search whose query names a person
        jest.mocked(useDynamicBackPath).mockReturnValue(
            createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(BANK_ACCOUNT_ID), ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense from:jane@example.com'})),
        );
        mockFetch.pause();

        try {
            await renderPage();

            // When the user presses Continue
            await pressContinue();

            // Then the return URL keeps the Search page but drops the query, since Search falls back to its default query without it
            TestHelper.expectAPICommandToHaveBeenCalledWith(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, 0, {
                bankAccountID: BANK_ACCOUNT_ID,
                redirectURL: `https://new.expensify.com/search/global-reimbursements/${BANK_ACCOUNT_ID}/status`,
            });
        } finally {
            // The mock is module-level, so the other tests get the Wallet path back even if an assertion fails
            jest.mocked(useDynamicBackPath).mockReturnValue(WALLET_INTRO_PATH);
        }
    });

    it("sends Wise and the form's screen the full status path when the page opened without the intro underneath", async () => {
        // Given the page opened straight from the Wallet, so the intro is not on the stack and the path rebuilt from the stack has no bank account
        jest.mocked(useDynamicBackPath).mockReturnValue(ROUTES.SETTINGS_WALLET);
        mockKYCReviewLinkResponse(mockFetch, KYC_REVIEW_URL);
        mockFetch.pause();

        try {
            await renderPage();

            // When the user presses Continue
            await pressContinue();

            // Then the return URL is built over the Wallet, since a URL without the bank account cannot load the status page
            TestHelper.expectAPICommandToHaveBeenCalledWith(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, 0, {
                bankAccountID: BANK_ACCOUNT_ID,
                redirectURL: `https://new.expensify.com/settings/wallet/global-reimbursements/${BANK_ACCOUNT_ID}/status`,
            });

            // When the server answers
            await resumeFetch();

            // Then the form opens over the same path, since on mobile a path without the bank account opens "not found"
            expect(openWiseKYCReview).toHaveBeenCalledWith(KYC_REVIEW_URL, `settings/wallet/global-reimbursements/${BANK_ACCOUNT_ID}/status`);
        } finally {
            // The mock is module-level, so the other tests get the intro path back even if an assertion fails
            jest.mocked(useDynamicBackPath).mockReturnValue(WALLET_INTRO_PATH);
        }
    });

    it("doesn't open the form again when the focused path changes after the form opened", async () => {
        // Given the link arrived and Wise's form opened over the status page
        mockKYCReviewLinkResponse(mockFetch, KYC_REVIEW_URL);
        await renderPage();
        await pressContinue();
        expect(openWiseKYCReview).toHaveBeenCalledTimes(1);

        try {
            // When the form's screen is focused, so the path read from the focused screen ends in the form, and the page underneath renders again
            const formPath = createDynamicRoute(DYNAMIC_ROUTES.WISE_KYC_REVIEW.path, createDynamicRoute(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path, ROUTES.SETTINGS_WALLET));
            jest.mocked(useDynamicBackPath).mockImplementation((suffix) => stripDynamicRouteSuffixFromPath(formPath, suffix));
            await act(() => Onyx.set(ONYXKEYS.IS_LOADING_PAYMENT_METHODS, true));
            await waitForBatchedUpdatesWithAct();

            // Then the form isn't opened again over a path built from the form's own, which opens "not found"
            expect(openWiseKYCReview).toHaveBeenCalledTimes(1);
        } finally {
            // The mock is module-level, so the other tests get the intro path back even if an assertion fails
            jest.mocked(useDynamicBackPath).mockReturnValue(WALLET_INTRO_PATH);
        }
    });

    it('shows an error above Continue when the link cannot be fetched', async () => {
        // Given a server that rejects the request
        mockFetch.mockAPICommand(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, () => ({jsonCode: CONST.JSON_CODE.EXP_ERROR}));
        await renderPage();

        // When the user presses Continue
        await pressContinue();

        // Then the error shows, Continue stops spinning so the user can retry, and nothing redirects
        expect(screen.getByText(TestHelper.translateLocal('common.genericErrorMessage'))).toBeOnTheScreen();
        expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toEqual(expect.objectContaining({isLoading: false}));
        expect(openWiseKYCReview).not.toHaveBeenCalled();
    });

    it('clears the stuck loading state when the connection comes back', async () => {
        // Given the user pressed Continue and the connection dropped before the response, so no failureData resets isLoading
        mockFetch.pause();
        await renderPage();
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

    it("keeps the link of an open form when the connection comes back, so the form doesn't lose it", async () => {
        // Given the link arrived and Wise's form is open on top of the page
        mockKYCReviewLinkResponse(mockFetch, KYC_REVIEW_URL);
        await renderPage();
        await pressContinue();
        act(() => {
            setHasRadio(false);
        });

        try {
            // When the connection comes back
            act(() => {
                setHasRadio(true);
            });
            await waitForBatchedUpdatesWithAct();

            // Then the link stays, since the open form reads it
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toEqual(expect.objectContaining({url: KYC_REVIEW_URL}));
        } finally {
            // Network state is module-level, so restore it even if an assertion fails
            setHasRadio(true);
        }
    });
});

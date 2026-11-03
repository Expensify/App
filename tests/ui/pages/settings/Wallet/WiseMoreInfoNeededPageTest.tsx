import {act, fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {READ_COMMANDS} from '@libs/API/types';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {setHasRadio} from '@libs/NetworkState';
import openWiseKYCReview from '@libs/openWiseKYCReview';

import WiseMoreInfoNeededPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseMoreInfoNeededPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../../../../utils/getOnyxValue';
import * as TestHelper from '../../../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const BANK_ACCOUNT_ID = 9053192;
const CONTINUE_BUTTON_TEST_ID = 'confirmation-primary-button';
const KYC_REVIEW_URL = 'https://sandbox.transferwise.tech/embedded-flows/kyc-review?token=abc';

jest.mock('@libs/openWiseKYCReview', () => jest.fn());
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/9053192'));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

async function renderPage() {
    await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.WISE_REIMBURSEMENTS]);
    render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_MORE_INFO_NEEDED}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_MORE_INFO_NEEDED}
                        component={WiseMoreInfoNeededPage}
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
    fireEvent.press(screen.getByTestId(CONTINUE_BUTTON_TEST_ID));
    await waitForBatchedUpdatesWithAct();
}

async function resumeFetch() {
    await act(async () => {
        await mockFetch.resume();
    });
    await waitForBatchedUpdatesWithAct();
}

describe('WiseMoreInfoNeededPage', () => {
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
        // Given the page opened from the terms for a bank account, and a server that answers with a link
        mockKYCReviewLinkResponse();
        mockFetch.pause();
        await renderPage();

        // When the user presses Continue
        await pressContinue();

        // Then the link is fetched for the bank account from the route, since Wise's form is tied to it, and Continue spins until it arrives
        TestHelper.expectAPICommandToHaveBeenCalledWith(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, 0, {bankAccountID: BANK_ACCOUNT_ID});
        expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK)).toEqual({isLoading: true});
        expect(openWiseKYCReview).not.toHaveBeenCalled();

        // When the server answers
        await resumeFetch();

        // Then Wise's form opens with the link
        expect(openWiseKYCReview).toHaveBeenCalledWith(KYC_REVIEW_URL);
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
        mockKYCReviewLinkResponse();
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

    it('goes back to the screen the flow started from', async () => {
        // Given the page replaced the terms over the intro opened from the wallet
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage();

        // When the user presses the back button
        fireEvent.press(screen.getByLabelText('common.back'));

        // Then the user leaves the intro too rather than reopening the form, since our part of the flow is done
        expect(goBackSpy).toHaveBeenCalledWith('settings/wallet');
        goBackSpy.mockRestore();
    });
});

import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';

import ReimbursementAccountPage from '@pages/ReimbursementAccount/ReimbursementAccountPage';
import VerifiedBankAccountFlowEntryPoint from '@pages/ReimbursementAccount/VerifiedBankAccountFlowEntryPoint';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as ReimbursementAccountTestUtils from '../utils/ReimbursementAccountTestUtils';

import createMock from '../utils/createMock';
import {buildAchData, POLICY_ID} from '../utils/ReimbursementAccountTestUtils';
import {setupGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
    usePreventRemove: jest.fn(),
}));
jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@hooks/useRootNavigationState', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({__esModule: true, default: () => ({didScreenTransitionEnd: true})}));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: jest.requireActual<typeof ReimbursementAccountTestUtils>('../utils/ReimbursementAccountTestUtils').createNavigationMock(),
}));
// The page owns currency branching. This terminal boundary records the chosen setup branch.
jest.mock('@pages/ReimbursementAccount/VerifiedBankAccountFlowEntryPoint', () => jest.fn(() => null));
jest.mock('@components/ReimbursementAccountLoadingIndicator', () => jest.fn(() => null));

setupGlobalFetchMock();

type PageProps = PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT>;
const navigation = createMock<PageProps['navigation']>({});
const CARD_ROUTE = ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(POLICY_ID);
const WORKSPACE_ROUTE = ROUTES.WORKSPACE_WORKFLOWS.getRoute(POLICY_ID);
const CURRENCY_ERROR = /Oops! It appears that your workspace currency/;

async function renderCurrencyPage(outputCurrency: string, backTo: PageProps['route']['params']['backTo']) {
    const policy = {
        id: POLICY_ID,
        name: 'Currency workspace',
        outputCurrency,
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.CORPORATE,
        owner: 'admin@example.com',
    } satisfies Policy;
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
            achData: buildAchData({state: CONST.BANK_ACCOUNT.STATE.SETUP, currentStep: CONST.BANK_ACCOUNT.STEP.COUNTRY, currency: CONST.CURRENCY.CAD}),
            isLoading: false,
        });
        await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {currency: CONST.CURRENCY.AUD});
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await waitForBatchedUpdatesWithAct();
    });
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <ReimbursementAccountPage
                navigation={navigation}
                route={{key: 'currency-route', name: SCREENS.REIMBURSEMENT_ACCOUNT_ROOT, params: {policyID: POLICY_ID, backTo}}}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('ReimbursementAccountPage currency routing', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
        jest.clearAllMocks();
    });

    it.each([undefined, WORKSPACE_ROUTE, CARD_ROUTE])('keeps USD on the global reimbursement branch for backTo %s', async (backTo) => {
        // Given USD is supported globally even though the card helper accepts only GBP and EUR
        // When the real page opens through each entry route
        await renderCurrencyPage(CONST.CURRENCY.USD, backTo);

        // Then the setup child receives the original optional card result and route
        expect(VerifiedBankAccountFlowEntryPoint).toHaveBeenCalled();
        const props = jest.mocked(VerifiedBankAccountFlowEntryPoint).mock.calls.at(-1)?.[0];
        expect(props).toBeDefined();
        expect(props?.backTo).toBe(backTo);
        expect(props?.isComingFromExpensifyCard).toBe(backTo === undefined ? undefined : backTo === CARD_ROUTE);
        expect(screen.queryByText(CURRENCY_ERROR)).not.toBeOnTheScreen();
    });

    it.each([CONST.CURRENCY.GBP, CONST.CURRENCY.EUR])('allows %s for an Expensify Card route', async (currency) => {
        // Given these are the two supported non-USD card currencies
        // When the real card helper participates in the page branch
        await renderCurrencyPage(currency, CARD_ROUTE);

        // Then the page reaches setup with card context intact
        expect(VerifiedBankAccountFlowEntryPoint).toHaveBeenCalledWith(expect.objectContaining({isComingFromExpensifyCard: true}), undefined);
        expect(screen.queryByText(CURRENCY_ERROR)).not.toBeOnTheScreen();
    });

    it.each([CONST.CURRENCY.AUD, CONST.CURRENCY.CAD])('restricts globally supported %s for cards', async (currency) => {
        // Given a currency supported by global reimbursement and rejected by cards
        // When the card route is evaluated
        await renderCurrencyPage(currency, CARD_ROUTE);

        // Then the real error is visible and setup has not been selected
        expect(VerifiedBankAccountFlowEntryPoint).not.toHaveBeenCalled();
        expect(screen.getByText(CURRENCY_ERROR)).toBeOnTheScreen();
    });

    it.each([CONST.CURRENCY.AUD, CONST.CURRENCY.CAD, CONST.CURRENCY.GBP, CONST.CURRENCY.EUR].flatMap((currency) => [undefined, WORKSPACE_ROUTE].map((backTo) => ({currency, backTo}))))(
        'allows $currency with non-card backTo $backTo',
        async ({currency, backTo}) => {
            // Given the same currency should use the broader global support contract
            // When the page opens from workspace workflows
            await renderCurrencyPage(currency, backTo);

            // Then it reaches setup rather than applying the card restriction
            expect(VerifiedBankAccountFlowEntryPoint).toHaveBeenCalledWith(expect.objectContaining({isComingFromExpensifyCard: backTo === undefined ? undefined : false}), undefined);
        },
    );

    it.each([undefined, WORKSPACE_ROUTE, CARD_ROUTE])('restricts an unsupported currency for backTo %s', async (backTo) => {
        // Given policy currency takes precedence over the supported ACH and draft currencies
        // When an unsupported non-USD currency reaches the real support helpers
        await renderCurrencyPage('JPY', backTo);

        // Then unsupported inputs remain visible to the error branch
        expect(VerifiedBankAccountFlowEntryPoint).not.toHaveBeenCalled();
        expect(screen.getByText(CURRENCY_ERROR)).toBeOnTheScreen();
    });
});

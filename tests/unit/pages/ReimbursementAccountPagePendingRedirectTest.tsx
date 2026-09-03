import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';

import ReimbursementAccountPage from '@pages/ReimbursementAccount/ReimbursementAccountPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, ReimbursementAccount} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as ReimbursementAccountTestUtils from '../../utils/ReimbursementAccountTestUtils';

import createMock from '../../utils/createMock';
import {BACK_TO, buildAchData, OTHER_POLICY_ID, PENDING_ACCOUNT, POLICY_ID} from '../../utils/ReimbursementAccountTestUtils';
import {getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

// Mutable so individual tests can simulate the validation step covering this page and the user coming back to it.
let mockIsFocused = true;

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => mockIsFocused,
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: jest.requireActual<typeof ReimbursementAccountTestUtils>('../../utils/ReimbursementAccountTestUtils').createNavigationMock(),
}));

// Stub the terminal screens so the assertions are about which branch the page picked, not about their internals.
let mockLoaderBackPress: (() => void) | undefined;
const mockEntryPoint = jest.fn(() => null);
const mockLoadingIndicator = jest.fn((props: {onBackButtonPress: () => void}) => {
    mockLoaderBackPress = props.onBackButtonPress;
    return null;
});

jest.mock('@pages/ReimbursementAccount/VerifiedBankAccountFlowEntryPoint', () => ({
    __esModule: true,
    default: () => mockEntryPoint(),
}));

jest.mock('@components/ReimbursementAccountLoadingIndicator', () => ({
    __esModule: true,
    default: (props: {onBackButtonPress: () => void}) => mockLoadingIndicator(props),
}));

const USD_POLICY: Policy = {
    id: POLICY_ID,
    name: 'Test workspace',
    outputCurrency: CONST.CURRENCY.USD,
    role: CONST.POLICY.ROLE.ADMIN,
    type: CONST.POLICY.TYPE.CORPORATE,
    owner: 'admin@example.com',
};

const EUR_POLICY: Policy = {...USD_POLICY, outputCurrency: CONST.CURRENCY.EUR};

// A policy that has loaded without publishing a currency. `Policy` declares outputCurrency as required, so the mock
// helper is what lets this fixture describe the partially-loaded shape Onyx can actually hold.
const NO_CURRENCY_POLICY = createMock<Policy>({...USD_POLICY, outputCurrency: undefined});

type RouteParams = ReimbursementAccountNavigatorParamList[typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT];
type PageProps = PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT>;

const buildRoute = (params: RouteParams): PageProps['route'] => ({
    key: 'reimbursement-account-root',
    name: SCREENS.REIMBURSEMENT_ACCOUNT_ROOT,
    params,
});

// The page does not read the navigation prop; this inert double only satisfies the navigator-provided prop.
const navigation = createMock<PageProps['navigation']>({});

// The policy reaches the page through the real withPolicy HOC, which reads it from Onyx by the route's policyID.
const seedOnyx = async (account: ReimbursementAccount, policy: Policy | null = USD_POLICY) => {
    await act(async () => {
        await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, account);
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await waitForBatchedUpdatesWithAct();
    });
};

const pageElement = (params: RouteParams) => (
    <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
        <ReimbursementAccountPage
            route={buildRoute(params)}
            navigation={navigation}
        />
    </ComposeProviders>
);

const renderPage = async (params: RouteParams = {policyID: POLICY_ID}) => {
    const rendered = render(pageElement(params));
    await waitForBatchedUpdatesWithAct();
    return rendered;
};

const validationRoute = (backTo?: string) =>
    backTo ? `bank-account/new/us/validation?policyID=${POLICY_ID}&backTo=${encodeURIComponent(backTo)}` : `bank-account/new/us/validation?policyID=${POLICY_ID}`;

/**
 * Asserts the page neither navigated into the validation step nor parked itself on the redirect loader, which is the
 * other way a wrongly-derived redirect condition shows up: the page stops painting the entry point and never leaves.
 */
const expectNoPendingRedirect = () => {
    expect(Navigation.navigate).not.toHaveBeenCalledWith(expect.stringContaining('bank-account/new/us/validation'));
    expect(mockEntryPoint).toHaveBeenCalled();
};

const pressLoaderBackButton = () => {
    expect(mockLoadingIndicator).toHaveBeenCalled();
    mockLoaderBackPress?.();
};

const getReimbursementAccount = () =>
    new Promise<ReimbursementAccount | undefined>((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });

describe('ReimbursementAccountPage pending USD redirect', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        global.fetch = getGlobalFetchMock();
    });

    beforeEach(() => {
        mockIsFocused = true;
        mockLoaderBackPress = undefined;
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('when the account is pending', () => {
        it('redirects to the validation step instead of painting the Continue setup entry point', async () => {
            // Given a USD bank account for this policy that is pending validation
            await seedOnyx(PENDING_ACCOUNT);

            // When the page is opened for that policy
            await renderPage();

            // Then it pushes the validation step and never renders the entry point
            expect(Navigation.navigate).toHaveBeenCalledWith(validationRoute());
            expect(mockEntryPoint).not.toHaveBeenCalled();
            expect(mockLoadingIndicator).toHaveBeenCalled();
        });

        it('carries backTo through to the validation route', async () => {
            // Given a pending account reached from a screen that passed backTo
            await seedOnyx(PENDING_ACCOUNT);

            // When the page is opened with that backTo
            await renderPage({policyID: POLICY_ID, backTo: BACK_TO});

            // Then the redirect preserves it so the validation step can return there
            expect(Navigation.navigate).toHaveBeenCalledWith(validationRoute(BACK_TO));
        });

        it('redirects only once even when Onyx pushes another update for the same account', async () => {
            // Given a pending account that has already redirected
            await seedOnyx(PENDING_ACCOUNT);
            await renderPage();
            expect(Navigation.navigate).toHaveBeenCalledTimes(1);

            // When another update lands for the same account
            await act(async () => {
                await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {bankAccountID: 5678}});
                await waitForBatchedUpdatesWithAct();
            });

            // Then the redirect is not dispatched a second time
            expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        });

        // policyCurrency only falls back to achData/the draft while `policy` is falsy, and this page paints the
        // not-found view rather than the entry point in that state. So these two assert the navigation the fallback
        // produced, not the render: without the fallback the currency is undefined and no redirect is dispatched.
        it('redirects on the account currency when the policy has not loaded yet', async () => {
            // Given a pending USD account whose policy is not in Onyx, so policyCurrency falls back to achData
            await seedOnyx(PENDING_ACCOUNT, null);

            // When the page is opened for that policy
            await renderPage();

            // Then the fallback currency still drives the redirect
            expect(Navigation.navigate).toHaveBeenCalledWith(validationRoute());
        });

        it('redirects on the draft currency when neither the policy nor the account carries one', async () => {
            // Given a pending account with no currency of its own, reached mid-setup so only the draft has one
            await act(async () => {
                await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {currency: CONST.CURRENCY.USD});
                await waitForBatchedUpdatesWithAct();
            });
            await seedOnyx({...PENDING_ACCOUNT, achData: buildAchData({currency: undefined})}, null);

            // When the page is opened for that policy
            await renderPage();

            // Then the last leg of the currency fallback drives the redirect
            expect(Navigation.navigate).toHaveBeenCalledWith(validationRoute());
        });

        it('keeps the account data in Onyx when it unmounts because it redirected', async () => {
            // Given a pending account that redirected into the validation step
            await seedOnyx(PENDING_ACCOUNT);
            const {unmount} = await renderPage();
            expect(Navigation.navigate).toHaveBeenCalledWith(validationRoute());

            // When this page unmounts behind the validation step
            await act(async () => {
                unmount();
                await waitForBatchedUpdatesWithAct();
            });

            // Then the data ConnectBankAccount reads survives, instead of being reset to the blank-RHP default
            expect(await getReimbursementAccount()).toEqual(PENDING_ACCOUNT);
        });
    });

    describe('loader back button', () => {
        it('returns to backTo when one was passed', async () => {
            // Given a pending account opened with a backTo
            await seedOnyx(PENDING_ACCOUNT);
            await renderPage({policyID: POLICY_ID, backTo: BACK_TO});

            // When the user presses back on the loader
            pressLoaderBackButton();

            // Then it leaves the flow to where the user came from
            expect(Navigation.goBack).toHaveBeenCalledWith(BACK_TO);
        });

        it('dismisses the modal when there is no backTo', async () => {
            // Given a pending account opened without a backTo
            await seedOnyx(PENDING_ACCOUNT);
            await renderPage();

            // When the user presses back on the loader
            pressLoaderBackButton();

            // Then it leaves the flow rather than stepping back into a page that redirects again
            expect(Navigation.dismissModal).toHaveBeenCalled();
            expect(Navigation.goBack).not.toHaveBeenCalled();
            expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
        });
    });

    describe('returning to the page after the redirect', () => {
        it('leaves the flow when the user navigates back onto it', async () => {
            // Given a pending account that redirected into the validation step
            await seedOnyx(PENDING_ACCOUNT);
            const {rerender} = await renderPage({policyID: POLICY_ID, backTo: BACK_TO});

            const rerenderPage = async () => {
                rerender(pageElement({policyID: POLICY_ID, backTo: BACK_TO}));
                await waitForBatchedUpdatesWithAct();
            };

            // When the validation step covers this page and the user then goes back onto it
            mockIsFocused = false;
            await rerenderPage();
            mockIsFocused = true;
            await rerenderPage();

            // Then it leaves the flow instead of sitting on the loader forever
            expect(Navigation.goBack).toHaveBeenCalledWith(BACK_TO);
        });

        it('does not leave the flow while the redirect is still in flight', async () => {
            // Given a pending account whose redirect has dispatched but has not covered this page yet
            await seedOnyx(PENDING_ACCOUNT);
            const {rerender} = await renderPage({policyID: POLICY_ID, backTo: BACK_TO});

            // When the page re-renders while still focused
            rerender(pageElement({policyID: POLICY_ID, backTo: BACK_TO}));
            await waitForBatchedUpdatesWithAct();

            // Then it does not race the navigation it is meant to follow
            expect(Navigation.goBack).not.toHaveBeenCalled();
        });
    });

    describe('cases that must not redirect', () => {
        it.each([[CONST.BANK_ACCOUNT.STATE.OPEN], [CONST.BANK_ACCOUNT.STATE.VERIFYING], [CONST.BANK_ACCOUNT.STATE.SETUP], [CONST.BANK_ACCOUNT.STATE.LOCKED]])(
            'leaves a %s account on the normal flow',
            async (state) => {
                // Given a USD bank account for this policy that is not pending
                await seedOnyx({...PENDING_ACCOUNT, achData: buildAchData({state})});

                // When the page is opened
                await renderPage();

                // Then no redirect happens and the normal entry point is painted
                expectNoPendingRedirect();
            },
        );

        it('does not redirect a non-USD workspace', async () => {
            // Given a pending account on a workspace that does not pay out in USD
            await seedOnyx({...PENDING_ACCOUNT, achData: buildAchData({currency: CONST.CURRENCY.EUR})}, EUR_POLICY);

            // When the page is opened
            await renderPage({policyID: POLICY_ID});

            // Then the USD validation step is not opened
            expectNoPendingRedirect();
        });

        it('does not redirect a non-USD account when the policy has not loaded yet', async () => {
            // Given a pending non-USD account whose policy is not in Onyx, so policyCurrency falls back to achData
            await seedOnyx({...PENDING_ACCOUNT, achData: buildAchData({currency: CONST.CURRENCY.EUR})}, null);

            // When the page is opened
            await renderPage();

            // Then the fallback currency keeps the USD validation step closed
            expect(Navigation.navigate).not.toHaveBeenCalledWith(expect.stringContaining('bank-account/new/us/validation'));
        });

        it('does not redirect when no currency can be resolved at all', async () => {
            // Given a pending account carrying no currency, on a policy that has not published one either
            await seedOnyx({...PENDING_ACCOUNT, achData: buildAchData({currency: undefined})}, NO_CURRENCY_POLICY);

            // When the page is opened
            await renderPage();

            // Then the redirect stays closed rather than reading an absent currency as USD. This is the one case the
            // fix does not cover: getBankAccountConnectionStatus does treat absent as USD, so the Workflows row can
            // still offer Confirm and land the user on the entry point.
            expectNoPendingRedirect();
        });

        it('does not redirect while changing the bank account', async () => {
            // Given a pending account on a page opened to replace that account
            await seedOnyx(PENDING_ACCOUNT);

            // When the page is opened with isChangingBankAccount
            await renderPage({policyID: POLICY_ID, isChangingBankAccount: true});

            // Then the replacement flow is left alone
            expectNoPendingRedirect();
        });

        it('does not redirect when the pending account belongs to another policy', async () => {
            // Given persisted data describing a different policy's pending account
            await seedOnyx({...PENDING_ACCOUNT, achData: buildAchData({policyID: OTHER_POLICY_ID})});

            // When this policy's page is opened and its own fetch settles
            await renderPage();
            await act(async () => {
                await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: false});
                await waitForBatchedUpdatesWithAct();
            });

            // Then the stale account does not drag this policy into validation
            expectNoPendingRedirect();
        });

        it('does not redirect for an entry point that passes no policyID', async () => {
            // Given the Wallet entry point, which passes only a bankAccountID
            await seedOnyx(PENDING_ACCOUNT);

            // When the page is opened that way
            await renderPage({bankAccountID: '1234'});

            // Then there is nothing to match the persisted account against, so nothing is redirected
            expectNoPendingRedirect();
        });

        it('does not redirect before the account data has loaded', async () => {
            // Given a pending account whose data is still being fetched
            await seedOnyx({...PENDING_ACCOUNT, isLoading: true});

            // When the page is opened
            await renderPage();

            // Then it waits instead of redirecting on half-loaded data
            expect(Navigation.navigate).not.toHaveBeenCalledWith(expect.stringContaining('bank-account/new/us/validation'));
        });

        it('still clears the account on unmount when it did not redirect', async () => {
            // Given an open account, which never redirects
            await seedOnyx({...PENDING_ACCOUNT, achData: buildAchData({state: CONST.BANK_ACCOUNT.STATE.OPEN})});
            const {unmount} = await renderPage();

            // When the page unmounts
            await act(async () => {
                unmount();
                await waitForBatchedUpdatesWithAct();
            });

            // Then the existing cleanup still resets the account
            expect(await getReimbursementAccount()).toEqual(CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA);
        });
    });
});

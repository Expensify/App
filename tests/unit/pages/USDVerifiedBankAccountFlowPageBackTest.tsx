import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';

import USDVerifiedBankAccountFlowPage from '@pages/ReimbursementAccount/USD/USDVerifiedBankAccountFlowPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {ACHDataReimbursementAccount} from '@src/types/onyx/ReimbursementAccount';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'policy123';
const BACK_TO = ROUTES.WORKSPACE_WORKFLOWS.getRoute(POLICY_ID);

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => true,
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        goBack: jest.fn(),
        dismissModal: jest.fn(),
        closeRHPFlow: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        isTopmostRouteModalScreen: jest.fn(() => false),
        setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback?.()),
    },
}));

// Stub the step screens: the test only needs the back callback each one is handed, not its UI.
let mockStepBackPress: (() => void) | undefined;
const mockConnectBankAccount = jest.fn((props: {onBackButtonPress: () => void}) => {
    mockStepBackPress = props.onBackButtonPress;
    return null;
});
const mockCompleteVerification = jest.fn((props: {onBackButtonPress: () => void}) => {
    mockStepBackPress = props.onBackButtonPress;
    return null;
});

jest.mock('@pages/ReimbursementAccount/USD/ConnectBankAccount/ConnectBankAccount', () => ({
    __esModule: true,
    default: (props: {onBackButtonPress: () => void}) => mockConnectBankAccount(props),
}));

jest.mock('@pages/ReimbursementAccount/USD/CompleteVerification/CompleteVerification', () => ({
    __esModule: true,
    default: (props: {onBackButtonPress: () => void}) => mockCompleteVerification(props),
}));

// The remaining steps pull in native modules (Plaid, Onfido) that cannot load under Jest, and this test never renders
// them — only the back-navigation targets they contribute to the step order matter.
jest.mock('@pages/ReimbursementAccount/USD/BankInfo/BankInfo', () => ({__esModule: true, default: () => null}));
jest.mock('@pages/ReimbursementAccount/USD/Requestor/RequestorStep', () => ({__esModule: true, default: () => null}));
jest.mock('@pages/ReimbursementAccount/USD/Requestor/VerifyIdentity/VerifyIdentity', () => ({__esModule: true, default: () => null}));
jest.mock('@pages/ReimbursementAccount/USD/BusinessInfo/BusinessInfo', () => ({__esModule: true, default: () => null}));
jest.mock('@pages/ReimbursementAccount/USD/BeneficialOwnerInfo/BeneficialOwnersStep', () => ({__esModule: true, default: () => null}));
jest.mock('@pages/ReimbursementAccount/USD/KYBDocuments', () => ({__esModule: true, default: () => null}));
jest.mock('@pages/ReimbursementAccount/USD/Country', () => ({__esModule: true, default: () => null}));

/**
 * Only the fields the back handler branches on are set; the rest of the ACH shape is irrelevant here, hence the
 * assertion.
 */
const buildAchData = (overrides: Partial<ACHDataReimbursementAccount> = {}) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    ({
        policyID: POLICY_ID,
        state: CONST.BANK_ACCOUNT.STATE.PENDING,
        currentStep: CONST.BANK_ACCOUNT.STEP.VALIDATION,
        bankAccountID: 1234,
        currency: CONST.CURRENCY.USD,
        country: CONST.COUNTRY.US,
        ...overrides,
    }) as ACHDataReimbursementAccount;

const PENDING_ACCOUNT: ReimbursementAccount = {
    achData: buildAchData(),
    isLoading: false,
    shouldShowResetModal: false,
};

type RouteParams = ReimbursementAccountNavigatorParamList[typeof SCREENS.REIMBURSEMENT_ACCOUNT_USD];
type PageProps = PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_USD>;

// The page does not read the navigation prop; this inert double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as PageProps['navigation'];

const renderPage = async (params: RouteParams) => {
    const rendered = render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <USDVerifiedBankAccountFlowPage
                route={{key: 'reimbursement-account-usd', name: SCREENS.REIMBURSEMENT_ACCOUNT_USD, params}}
                navigation={navigation}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
    return rendered;
};

const seedAccount = async (account: ReimbursementAccount) => {
    await act(async () => {
        await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, account);
        await waitForBatchedUpdatesWithAct();
    });
};

/** Fires the back press of the step that the flow page decided to render, after confirming it is the expected one. */
const pressStepBackButton = (expectedStep: jest.Mock) => {
    expect(expectedStep).toHaveBeenCalled();
    mockStepBackPress?.();
};

describe('USDVerifiedBankAccountFlowPage back press', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockStepBackPress = undefined;
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('on the validation step of a pending account', () => {
        it('leaves the flow to backTo instead of returning to the page that redirects back here', async () => {
            // Given a pending account sitting on the validation step, opened with a backTo
            await seedAccount(PENDING_ACCOUNT);
            await renderPage({policyID: POLICY_ID, page: CONST.BANK_ACCOUNT.PAGE_NAMES.VALIDATION, backTo: BACK_TO});

            // When the user presses back
            pressStepBackButton(mockConnectBankAccount);

            // Then it goes where the user came from, not to the setup entry point
            expect(Navigation.goBack).toHaveBeenCalledWith(BACK_TO);
            expect(Navigation.goBack).not.toHaveBeenCalledWith(expect.stringContaining('bank-account/new'));
        });

        it('dismisses the modal when there is no backTo', async () => {
            // Given the same step reached without a backTo
            await seedAccount(PENDING_ACCOUNT);
            await renderPage({policyID: POLICY_ID, page: CONST.BANK_ACCOUNT.PAGE_NAMES.VALIDATION});

            // When the user presses back
            pressStepBackButton(mockConnectBankAccount);

            // Then it leaves the flow rather than popping onto a page that would redirect straight back
            expect(Navigation.dismissModal).toHaveBeenCalled();
            expect(Navigation.goBack).not.toHaveBeenCalled();
        });
    });

    describe('cases that keep stepping back through the flow', () => {
        it('steps back to the previous page when the account is not pending', async () => {
            // Given the validation step for an account that is still verifying
            await seedAccount({...PENDING_ACCOUNT, achData: buildAchData({state: CONST.BANK_ACCOUNT.STATE.VERIFYING})});
            await renderPage({policyID: POLICY_ID, page: CONST.BANK_ACCOUNT.PAGE_NAMES.VALIDATION, backTo: BACK_TO});

            // When the user presses back
            pressStepBackButton(mockConnectBankAccount);

            // Then the existing step-by-step behaviour is unchanged: back over the skipped KYB step to complete verification
            expect(Navigation.goBack).toHaveBeenCalledWith(expect.stringContaining(`bank-account/new/us/${CONST.BANK_ACCOUNT.PAGE_NAMES.ACH_CONTRACT}`));
            expect(Navigation.dismissModal).not.toHaveBeenCalled();
        });

        it('steps back to the previous page on a non-validation step of a pending account', async () => {
            // Given a pending account on an earlier step of the flow
            await seedAccount(PENDING_ACCOUNT);
            await renderPage({policyID: POLICY_ID, page: CONST.BANK_ACCOUNT.PAGE_NAMES.ACH_CONTRACT, backTo: BACK_TO});

            // When the user presses back
            pressStepBackButton(mockCompleteVerification);

            // Then the pending shortcut does not apply and the flow steps back as before
            expect(Navigation.goBack).toHaveBeenCalledWith(expect.stringContaining('bank-account/new/us/'));
            expect(Navigation.dismissModal).not.toHaveBeenCalled();
        });
    });
});

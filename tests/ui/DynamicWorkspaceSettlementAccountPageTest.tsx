import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {BankAccountListItem} from '@components/SettlementAccountSelector';

import {getMicroSecondOnyxErrorWithMessage} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DynamicWorkspaceSettlementAccountPage from '@pages/workspace/expensifyCard/DynamicWorkspaceSettlementAccountPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'policy123';
const WORKSPACE_ACCOUNT_ID = 424242;
const CURRENT_BANK_ACCOUNT_ID = 111;
const NEW_BANK_ACCOUNT_ID = 789;
let selectAccount: (value: number) => void;
let settlementAccountOptions: BankAccountListItem[];

jest.mock('@components/SettlementAccountSelector', () => ({
    __esModule: true,
    default: ({
        customHeaderContent,
        listOptions,
        onSelectAccount,
    }: {
        customHeaderContent?: React.ReactElement;
        listOptions: BankAccountListItem[];
        onSelectAccount: (value: number) => void;
    }) => {
        settlementAccountOptions = listOptions;
        selectAccount = onSelectAccount;
        return customHeaderContent ?? null;
    },
    BankAccountListItemLeftElement: () => null,
}));

jest.mock('@hooks/useDefaultFundID', () => ({
    __esModule: true,
    default: () => 424242,
}));

jest.mock('@hooks/useDynamicBackPath', () => ({
    __esModule: true,
    default: () => '',
}));

jest.mock('@hooks/useEnvironment', () => ({
    __esModule: true,
    default: () => ({environmentURL: 'https://new.expensify.com'}),
}));

jest.mock('@hooks/useExpensifyCardUkEuSupported', () => ({
    __esModule: true,
    default: () => false,
}));

jest.mock('@libs/actions/PolicyConnections', () => ({openPolicyAccountingPage: jest.fn()}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        goBack: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        isTopmostRouteModalScreen: jest.fn(() => false),
    },
}));

jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

jest.mock('@userActions/Card', () => ({
    clearSettlementAccountError: jest.fn(),
    updateSettlementAccount: jest.fn(),
}));

const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${WORKSPACE_ACCOUNT_ID}` as const;
const route: PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT>['route'] = {
    key: 'workspace-expensify-card-settlement-account',
    name: SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT,
    params: {policyID: POLICY_ID},
};
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT>['navigation'];

const renderPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DynamicWorkspaceSettlementAccountPage
                route={route}
                navigation={navigation}
            />
        </ComposeProviders>,
    );

describe('DynamicWorkspaceSettlementAccountPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.merge(cardSettingsKey, {
                [CONST.EXPENSIFY_CARD.CARD_PROGRAM.CURRENT]: {
                    paymentBankAccountID: CURRENT_BANK_ACCOUNT_ID,
                    domainName: 'example.com',
                },
            });
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('waits for a successful settlement account update before navigating back', async () => {
        renderPage();
        await waitForBatchedUpdatesWithAct();

        act(() => selectAccount(NEW_BANK_ACCOUNT_ID));
        expect(Navigation.goBack).not.toHaveBeenCalled();

        await act(async () => {
            await Onyx.merge(cardSettingsKey, {
                [CONST.EXPENSIFY_CARD.CARD_PROGRAM.CURRENT]: {paymentBankAccountID: NEW_BANK_ACCOUNT_ID},
                isLoading: false,
                pendingFields: {paymentBankAccountID: null},
            });
            await waitForBatchedUpdatesWithAct();
        });

        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
    });

    it('stays on the page and displays a backend settlement account error', async () => {
        renderPage();
        await waitForBatchedUpdatesWithAct();

        act(() => selectAccount(NEW_BANK_ACCOUNT_ID));
        await act(async () => {
            await Onyx.merge(cardSettingsKey, {
                isLoading: false,
                pendingFields: {paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                errorFields: {paymentBankAccountID: getMicroSecondOnyxErrorWithMessage('Reconnect this account through Plaid.', 1)},
            });
            await waitForBatchedUpdatesWithAct();
        });

        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(screen.getByText('Reconnect this account through Plaid.')).toBeTruthy();
    });

    it('keeps settlement account options enabled when unrelated card settings are loading', async () => {
        await act(async () => {
            await Onyx.merge(cardSettingsKey, {isLoading: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(settlementAccountOptions.every((option) => !option.isDisabled)).toBe(true);
    });
});

import {render} from '@testing-library/react-native';

import SelectionScreen from '@components/SelectionScreen';

import {updateDualEntrySettlementStreamBankAccount, updateDualEntrySettlementStreamCardAccount} from '@libs/actions/connections/DualEntry';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ExpensifyCardSettings, Policy} from '@src/types/onyx';
import type {DualEntrySettlementStream} from '@src/types/onyx/Policy';

import type {ComponentType} from 'react';

import React from 'react';

import createMock from '../../../../../utils/createMock';

type PageProps = {policy: Policy; route: {params: {policyID: string; currency: string; setting: string}}};

jest.mock('@pages/workspace/withPolicyConnections', () => (Component: ComponentType) => Component);

const DualEntrySettlementStreamAccountPage = require<{default: ComponentType<PageProps>}>('@pages/workspace/accounting/dualentry/advanced/DualEntrySettlementStreamAccountPage').default;

const POLICY_ID = '1';
const GBP_BANK_ACCOUNT = {id: '1010', name: 'GBP Checking', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.BANK, currency: CONST.CURRENCY.GBP, isActive: true};
const GBP_CARD_ACCOUNT = {id: '2010', name: 'Expensify Card GBP', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.BANK, currency: CONST.CURRENCY.GBP, isActive: true};
const USD_BANK_ACCOUNT = {id: '3010', name: 'USD Checking', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.BANK, currency: CONST.CURRENCY.USD, isActive: true};

let mockCardSettings: Record<string, ExpensifyCardSettings> = {};

jest.mock('@components/SelectionScreen', () => jest.fn(() => null));

jest.mock('@hooks/useExpensifyCardFeeds', () => ({
    __esModule: true,
    default: () => mockCardSettings,
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({Telescope: 1}),
}));

jest.mock('@hooks/useSelectionListSearch', () => ({
    __esModule: true,
    default: (data: unknown[]) => ({filteredData: data, textInputOptions: {}}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {goBack: jest.fn()},
}));

jest.mock('@libs/actions/connections/DualEntry', () => ({
    updateDualEntrySettlementStreamBankAccount: jest.fn(),
    updateDualEntrySettlementStreamCardAccount: jest.fn(),
    clearDualEntryErrorField: jest.fn(),
}));

jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: jest.fn(() => false)},
}));

function buildPolicy(stream: DualEntrySettlementStream = {}): Policy {
    return createMock<Policy>({
        id: POLICY_ID,
        connections: {
            dualEntry: {
                config: {sync: {settlementStreams: {[CONST.DUALENTRY_SETTLEMENT_STREAM.GBP]: stream}}},
                data: {accounts: [GBP_BANK_ACCOUNT, GBP_CARD_ACCOUNT, USD_BANK_ACCOUNT]},
            },
        },
    });
}

function renderPicker(currency: string, setting: string, stream?: DualEntrySettlementStream) {
    render(
        <DualEntrySettlementStreamAccountPage
            policy={buildPolicy(stream)}
            route={{params: {policyID: POLICY_ID, currency, setting}}}
        />,
    );
    const selectionScreenProps = jest.mocked(SelectionScreen).mock.calls.at(-1)?.[0];
    if (!selectionScreenProps) {
        throw new Error('Expected SelectionScreen to render');
    }
    return selectionScreenProps;
}

function getOption(selectionScreenProps: ReturnType<typeof renderPicker>, accountID: string) {
    const option = selectionScreenProps.data.find((item) => item.keyForList === accountID);
    if (!option) {
        throw new Error('Expected the account to be listed');
    }
    return option;
}

describe('DualEntrySettlementStreamAccountPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCardSettings = {feed: createMock<ExpensifyCardSettings>({[CONST.COUNTRY.GB]: {paymentBankAccountID: 123, currency: CONST.CURRENCY.GBP}})};
    });

    it('saves the picked account as the bank account of the stream in the URL', () => {
        // Given the GBP bank account picker of a stream that already uses the GBP card account
        const selectionScreenProps = renderPicker(CONST.CURRENCY.GBP, CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.BANK_ACCOUNT_ID, {cardAccountID: GBP_CARD_ACCOUNT.id});

        // Then only the other GBP account is listed, because the two sides of a stream need different accounts in its currency
        expect(selectionScreenProps.shouldBeBlocked).toBe(false);
        expect(selectionScreenProps.data.map((item) => item.keyForList)).toEqual([GBP_BANK_ACCOUNT.id]);

        // When the admin picks it
        selectionScreenProps.onSelectRow(getOption(selectionScreenProps, GBP_BANK_ACCOUNT.id));

        // Then it is saved as the GBP stream's bank account, not its card account, and the admin returns to the advanced page
        expect(updateDualEntrySettlementStreamBankAccount).toHaveBeenCalledWith(POLICY_ID, CONST.DUALENTRY_SETTLEMENT_STREAM.GBP, GBP_BANK_ACCOUNT.id, undefined);
        expect(updateDualEntrySettlementStreamCardAccount).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_DUALENTRY_ADVANCED.getRoute(POLICY_ID));
    });

    it('saves the picked account as the card account when the URL names the card account', () => {
        // Given the GBP card account picker of a stream that already has a card account
        const selectionScreenProps = renderPicker(CONST.CURRENCY.GBP, CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.CARD_ACCOUNT_ID, {cardAccountID: GBP_CARD_ACCOUNT.id});

        // When the admin picks a different account
        selectionScreenProps.onSelectRow(getOption(selectionScreenProps, GBP_BANK_ACCOUNT.id));

        // Then it replaces the card account, with the old one passed along for rollback
        expect(updateDualEntrySettlementStreamCardAccount).toHaveBeenCalledWith(POLICY_ID, CONST.DUALENTRY_SETTLEMENT_STREAM.GBP, GBP_BANK_ACCOUNT.id, GBP_CARD_ACCOUNT.id);
        expect(updateDualEntrySettlementStreamBankAccount).not.toHaveBeenCalled();
    });

    it('blocks a link to a currency or setting that is not part of a settlement stream', () => {
        // Given the currency and the setting come from the URL

        // When the page opens with a currency that has no stream, and with a setting that is not an account
        const unknownCurrencyProps = renderPicker(CONST.CURRENCY.USD, CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.BANK_ACCOUNT_ID);
        const unknownSettingProps = renderPicker(CONST.CURRENCY.GBP, CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.ENABLED);

        // Then both show the not found page with nothing to pick, so an edited link can't write an unexpected setting
        expect(unknownCurrencyProps).toEqual(expect.objectContaining({shouldBeBlocked: true, data: []}));
        expect(unknownSettingProps).toEqual(expect.objectContaining({shouldBeBlocked: true, data: []}));
    });

    it('blocks the picker of a stream the workspace cannot set up', () => {
        // Given a workspace whose UK/EU cards settle in GBP, so the advanced page shows no EUR section

        // When a link opens the EUR bank account picker
        const selectionScreenProps = renderPicker(CONST.CURRENCY.EUR, CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.BANK_ACCOUNT_ID);

        // Then it is blocked, the same way the advanced page hides the EUR section
        expect(selectionScreenProps.shouldBeBlocked).toBe(true);
    });
});

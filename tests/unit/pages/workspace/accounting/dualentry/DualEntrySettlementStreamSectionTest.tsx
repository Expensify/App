import {render} from '@testing-library/react-native';

import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import {updateDualEntrySettlementStreamEnabled} from '@libs/actions/connections/DualEntry';
import Navigation from '@libs/Navigation/Navigation';

import DualEntrySettlementStreamSection from '@pages/workspace/accounting/dualentry/advanced/DualEntrySettlementStreamSection';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ExpensifyCardSettings, Policy} from '@src/types/onyx';
import type {DualEntrySettlementStream} from '@src/types/onyx/Policy';

import type {ReactNode} from 'react';
import type {GestureResponderEvent} from 'react-native';

import React from 'react';

import createMock from '../../../../../utils/createMock';

const POLICY_ID = '1';
const GBP_BANK_ACCOUNT = {id: '1010', name: 'GBP Checking', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.BANK, currency: CONST.CURRENCY.GBP, isActive: true};
const GBP_CARD_ACCOUNT = {id: '2010', name: 'Expensify Card GBP', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.BANK, currency: CONST.CURRENCY.GBP, isActive: true};

let mockPolicy: Policy | undefined;
let mockCardSettings: Record<string, ExpensifyCardSettings> = {};

jest.mock('@hooks/usePolicy', () => ({
    __esModule: true,
    default: () => mockPolicy,
}));

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

jest.mock('@pages/workspace/workflows/ToggleSettingsOptionRow', () => jest.fn(() => null));

jest.mock('@components/MenuItem/presets/MenuItemField', () => jest.fn(() => null));

jest.mock('@components/MenuItem', () => ({
    __esModule: true,
    default: {BrickRoadIndicator: () => null},
}));

jest.mock('@components/OfflineWithFeedback', () => ({
    __esModule: true,
    default: ({children}: {children: ReactNode}) => children,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn()},
}));

jest.mock('@libs/actions/connections/DualEntry', () => ({
    updateDualEntrySettlementStreamEnabled: jest.fn(),
    clearDualEntryErrorField: jest.fn(),
}));

jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: jest.fn(() => false)},
}));

function setPolicy(stream?: DualEntrySettlementStream) {
    mockPolicy = createMock<Policy>({
        id: POLICY_ID,
        connections: {
            dualEntry: {
                config: {sync: {settlementStreams: stream ? {[CONST.DUALENTRY_SETTLEMENT_STREAM.GBP]: stream} : {}}},
                data: {accounts: [GBP_BANK_ACCOUNT, GBP_CARD_ACCOUNT]},
            },
        },
    });
}

function setUkEuCardProgramCurrency(currency: string) {
    mockCardSettings = {feed: createMock<ExpensifyCardSettings>({[CONST.COUNTRY.GB]: {paymentBankAccountID: 123, currency}})};
}

function renderGBPSection() {
    render(
        <DualEntrySettlementStreamSection
            policyID={POLICY_ID}
            currency={CONST.CURRENCY.GBP}
        />,
    );
}

function getSwitchProps() {
    const switchProps = jest.mocked(ToggleSettingOptionRow).mock.calls.at(-1)?.[0];
    if (!switchProps) {
        throw new Error('Expected the stream switch to render');
    }
    return switchProps;
}

describe('DualEntrySettlementStreamSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCardSettings = {};
        setPolicy();
    });

    it('is hidden when the UK/EU card program does not settle in the stream currency', () => {
        // Given a workspace whose UK/EU cards settle in EUR and whose GBP stream is off
        setUkEuCardProgramCurrency(CONST.CURRENCY.EUR);

        // When the GBP section renders
        renderGBPSection();

        // Then nothing is shown, because the workspace has no GBP settlements to sync
        expect(ToggleSettingOptionRow).not.toHaveBeenCalled();
        expect(MenuItemField).not.toHaveBeenCalled();
    });

    it('locks the switch until both accounts are selected', () => {
        // Given a workspace whose UK/EU cards settle in GBP and a stream with only a bank account
        setUkEuCardProgramCurrency(CONST.CURRENCY.GBP);
        setPolicy({bankAccountID: GBP_BANK_ACCOUNT.id});

        // When the GBP section renders
        renderGBPSection();

        // Then the switch is off and locked, because the backend refuses to turn a stream on without both accounts,
        // and both account rows are shown so the admin can finish the setup
        expect(getSwitchProps()).toEqual(expect.objectContaining({isActive: false, disabled: true}));
        expect(MenuItemField).toHaveBeenCalledTimes(2);
    });

    it('turns the stream on once both accounts are selected', () => {
        // Given a GBP stream that is off and has both accounts
        setUkEuCardProgramCurrency(CONST.CURRENCY.GBP);
        setPolicy({bankAccountID: GBP_BANK_ACCOUNT.id, cardAccountID: GBP_CARD_ACCOUNT.id});
        renderGBPSection();
        expect(getSwitchProps().disabled).toBe(false);

        // When the admin flips the switch
        getSwitchProps().onToggle(true);

        // Then the GBP stream is turned on under its backend key, with the old value for rollback
        expect(updateDualEntrySettlementStreamEnabled).toHaveBeenCalledWith(POLICY_ID, CONST.DUALENTRY_SETTLEMENT_STREAM.GBP, true, false);
    });

    it('stays visible while the stream is on so it can be turned off after the program currency changes', () => {
        // Given a GBP stream that is still on, in a workspace whose UK/EU cards now settle in EUR
        setUkEuCardProgramCurrency(CONST.CURRENCY.EUR);
        setPolicy({enabled: true, bankAccountID: GBP_BANK_ACCOUNT.id, cardAccountID: GBP_CARD_ACCOUNT.id});

        // When the GBP section renders and the admin flips the switch
        renderGBPSection();
        expect(getSwitchProps()).toEqual(expect.objectContaining({isActive: true, disabled: false}));
        getSwitchProps().onToggle(false);

        // Then the stream can still be turned off, otherwise it would keep syncing with no way to stop it
        expect(updateDualEntrySettlementStreamEnabled).toHaveBeenCalledWith(POLICY_ID, CONST.DUALENTRY_SETTLEMENT_STREAM.GBP, false, true);
    });

    it('opens the picker for the account row that was pressed', () => {
        // Given a visible GBP section
        setUkEuCardProgramCurrency(CONST.CURRENCY.GBP);
        renderGBPSection();
        const [bankAccountRowProps, cardAccountRowProps] = jest.mocked(MenuItemField).mock.calls.map(([props]) => props);

        // When each account row is pressed
        bankAccountRowProps?.onPress?.(createMock<GestureResponderEvent>({}));
        cardAccountRowProps?.onPress?.(createMock<GestureResponderEvent>({}));

        // Then each opens the picker for its own currency and setting, so the two rows can't write to each other's account
        expect(Navigation.navigate).toHaveBeenNthCalledWith(
            1,
            ROUTES.POLICY_ACCOUNTING_DUALENTRY_SETTLEMENT_STREAM_ACCOUNT.getRoute(POLICY_ID, CONST.CURRENCY.GBP, CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.BANK_ACCOUNT_ID),
        );
        expect(Navigation.navigate).toHaveBeenNthCalledWith(
            2,
            ROUTES.POLICY_ACCOUNTING_DUALENTRY_SETTLEMENT_STREAM_ACCOUNT.getRoute(POLICY_ID, CONST.CURRENCY.GBP, CONST.DUALENTRY_SETTLEMENT_STREAM_SETTING.CARD_ACCOUNT_ID),
        );
    });
});

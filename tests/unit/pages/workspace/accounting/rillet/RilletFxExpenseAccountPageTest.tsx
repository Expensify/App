import {act, render} from '@testing-library/react-native';

import SelectionScreen from '@components/SelectionScreen';

import {updateRilletFxExpenseAccount} from '@libs/actions/connections/Rillet';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {ComponentType} from 'react';

import React from 'react';

import createMock from '../../../../../utils/createMock';

jest.mock('@pages/workspace/withPolicyConnections', () => (Component: ComponentType) => Component);

const RilletFxExpenseAccountPage = require<{default: ComponentType<{policy: Policy}>}>('@pages/workspace/accounting/rillet/advanced/RilletFxExpenseAccountPage').default;

jest.mock('@components/SelectionScreen', () => jest.fn(() => null));

jest.mock('@hooks/useCanConfigureCurrencyConversionFees', () => ({
    __esModule: true,
    default: () => true,
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

jest.mock('@libs/actions/connections/Rillet', () => ({
    updateRilletFxExpenseAccount: jest.fn(),
    clearRilletErrorField: jest.fn(),
}));

jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: jest.fn(() => false)},
}));

const BANK_FEES_ACCOUNT = {id: 'a1', code: '6100', name: 'Bank Fees', type: CONST.RILLET_ACCOUNT_TYPE.EXPENSE, status: CONST.RILLET_ACCOUNT_STATUS.ACTIVE};
const INACTIVE_EXPENSE_ACCOUNT = {id: 'a2', code: '6200', name: 'Old Fees', type: CONST.RILLET_ACCOUNT_TYPE.EXPENSE, status: CONST.RILLET_ACCOUNT_STATUS.INACTIVE};
const CASH_ACCOUNT = {id: 'a3', code: '1000', name: 'Cash', type: CONST.RILLET_ACCOUNT_TYPE.ASSET, status: CONST.RILLET_ACCOUNT_STATUS.ACTIVE};
const ALL_ACCOUNTS = [BANK_FEES_ACCOUNT, INACTIVE_EXPENSE_ACCOUNT, CASH_ACCOUNT];

function buildPolicy({fxExpenseAccountCode, syncReimbursedReports = true}: {fxExpenseAccountCode?: string; syncReimbursedReports?: boolean} = {}): Policy {
    return createMock<Policy>({
        id: '1',
        connections: {
            rillet: {
                config: {
                    sync: {syncReimbursedReports, fxExpenseAccountCode},
                },
                data: {accounts: ALL_ACCOUNTS},
            },
        },
    });
}

function renderPicker(config: Parameters<typeof buildPolicy>[0] = {}) {
    render(<RilletFxExpenseAccountPage policy={buildPolicy(config)} />);
    return getSelectionScreenProps();
}

function getSelectionScreenProps() {
    const selectionScreenProps = jest.mocked(SelectionScreen).mock.calls.at(-1)?.[0];
    if (!selectionScreenProps) {
        throw new Error('Expected SelectionScreen to render');
    }
    return selectionScreenProps;
}

describe('RilletFxExpenseAccountPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('lists None and only active expense accounts', () => {
        // Given: a chart of accounts with an active expense account, an inactive one and an asset account.
        // When: the picker is opened with no saved fee account.
        const selectionScreenProps = renderPicker();

        // Then: the cost can only be booked to an active expense account, and None is selected.
        expect(selectionScreenProps.data.map((item) => item.keyForList)).toEqual([CONST.SEARCH.NONE_OPTION_KEY, BANK_FEES_ACCOUNT.code]);
        expect(selectionScreenProps.data.at(0)).toEqual(expect.objectContaining({value: '', isSelected: true}));
        expect(selectionScreenProps.confirmButtonOptions?.isDisabled).toBe(true);
    });

    it('saves the tapped account only when Save is pressed', () => {
        // Given: the picker is open.
        renderPicker();

        // When: an account is tapped.
        act(() => {
            getSelectionScreenProps().onSelectRow({value: BANK_FEES_ACCOUNT.code, text: BANK_FEES_ACCOUNT.name, keyForList: BANK_FEES_ACCOUNT.code, isSelected: false});
        });

        // Then: nothing is written until Save.
        expect(updateRilletFxExpenseAccount).not.toHaveBeenCalled();

        // When: Save is pressed.
        act(() => {
            getSelectionScreenProps().confirmButtonOptions?.onConfirm?.();
        });

        // Then: the account code is written and we return to Advanced.
        expect(updateRilletFxExpenseAccount).toHaveBeenCalledWith('1', BANK_FEES_ACCOUNT.code, undefined);
        expect(Navigation.goBack).toHaveBeenCalled();
    });

    it('clears the saved account when None is saved', () => {
        // Given: a fee account is already saved.
        renderPicker({fxExpenseAccountCode: BANK_FEES_ACCOUNT.code});

        // When: None is selected and Save is pressed.
        act(() => {
            getSelectionScreenProps().onSelectRow({value: '', text: 'common.none', keyForList: CONST.SEARCH.NONE_OPTION_KEY, isSelected: false});
        });
        act(() => {
            getSelectionScreenProps().confirmButtonOptions?.onConfirm?.();
        });

        // Then: the setting is cleared so the cost stops being exported.
        expect(updateRilletFxExpenseAccount).toHaveBeenCalledWith('1', '', BANK_FEES_ACCOUNT.code);
    });

    it('blocks the picker while reimbursed reports are not synced', () => {
        // Given: Sync reimbursed reports is off, so no bill payment is posted for the cost to follow.
        // When: the picker is opened, for example from a deep link.
        const selectionScreenProps = renderPicker({syncReimbursedReports: false});

        // Then: the picker is blocked, matching the hidden Advanced row.
        expect(selectionScreenProps.shouldBeBlocked).toBe(true);
    });
});

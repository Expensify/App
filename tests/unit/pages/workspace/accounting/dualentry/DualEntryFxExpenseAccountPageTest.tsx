import {act, render} from '@testing-library/react-native';

import SelectionScreen from '@components/SelectionScreen';

import {updateDualEntryFxExpenseAccount} from '@libs/actions/connections/DualEntry';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {ComponentType} from 'react';

import React from 'react';

import createMock from '../../../../../utils/createMock';

jest.mock('@pages/workspace/withPolicyConnections', () => (Component: ComponentType) => Component);

const DualEntryFxExpenseAccountPage = require<{default: ComponentType<{policy: Policy}>}>('@pages/workspace/accounting/dualentry/advanced/DualEntryFxExpenseAccountPage').default;

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

jest.mock('@libs/actions/connections/DualEntry', () => ({
    updateDualEntryFxExpenseAccount: jest.fn(),
    clearDualEntryErrorField: jest.fn(),
}));

jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: jest.fn(() => false)},
}));

const BANK_FEES_ACCOUNT = {id: '6100', name: 'Bank Fees', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.EXPENSE, isActive: true};
const INACTIVE_EXPENSE_ACCOUNT = {id: '6200', name: 'Old Fees', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.EXPENSE, isActive: false};
const CASH_ACCOUNT = {id: '1000', name: 'Cash', accountType: CONST.DUALENTRY_ACCOUNT_TYPE.BANK, isActive: true};
const ALL_ACCOUNTS = [BANK_FEES_ACCOUNT, INACTIVE_EXPENSE_ACCOUNT, CASH_ACCOUNT];

function buildPolicy({fxExpenseAccountID, syncReimbursedReports = true}: {fxExpenseAccountID?: string; syncReimbursedReports?: boolean} = {}): Policy {
    return createMock<Policy>({
        id: '1',
        connections: {
            dualEntry: {
                config: {
                    sync: {syncReimbursedReports, fxExpenseAccountID},
                },
                data: {accounts: ALL_ACCOUNTS},
            },
        },
    });
}

function renderPicker(config: Parameters<typeof buildPolicy>[0] = {}) {
    render(<DualEntryFxExpenseAccountPage policy={buildPolicy(config)} />);
    return getSelectionScreenProps();
}

function getSelectionScreenProps() {
    const selectionScreenProps = jest.mocked(SelectionScreen).mock.calls.at(-1)?.[0];
    if (!selectionScreenProps) {
        throw new Error('Expected SelectionScreen to render');
    }
    return selectionScreenProps;
}

describe('DualEntryFxExpenseAccountPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('lists None and only active expense accounts', () => {
        // Given: a chart of accounts with an active expense account, an inactive one and a bank account.
        // When: the picker is opened with no saved fee account.
        const selectionScreenProps = renderPicker();

        // Then: the cost can only be booked to an active expense account, and None is selected.
        expect(selectionScreenProps.data.map((item) => item.keyForList)).toEqual([CONST.SEARCH.NONE_OPTION_KEY, BANK_FEES_ACCOUNT.id]);
        expect(selectionScreenProps.data.at(0)).toEqual(expect.objectContaining({value: '', isSelected: true}));
        expect(selectionScreenProps.confirmButtonOptions?.isDisabled).toBe(true);
        expect(selectionScreenProps.shouldSingleExecuteRowSelect).toBe(true);
        expect(selectionScreenProps.shouldUpdateFocusedIndex).toBe(true);
        expect(selectionScreenProps.data.at(1)?.text).toBe(`${BANK_FEES_ACCOUNT.id} ${BANK_FEES_ACCOUNT.name}`);
    });

    it('saves the tapped account only when Save is pressed', () => {
        // Given: the picker is open.
        renderPicker();

        // When: an account is tapped.
        act(() => {
            getSelectionScreenProps().onSelectRow({value: BANK_FEES_ACCOUNT.id, text: BANK_FEES_ACCOUNT.name, keyForList: BANK_FEES_ACCOUNT.id, isSelected: false});
        });

        // Then: nothing is written until Save.
        expect(updateDualEntryFxExpenseAccount).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();

        // When: Save is pressed.
        act(() => {
            getSelectionScreenProps().confirmButtonOptions?.onConfirm?.();
        });

        // Then: the account ID is written and we return to Advanced.
        expect(updateDualEntryFxExpenseAccount).toHaveBeenCalledWith('1', BANK_FEES_ACCOUNT.id, undefined);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_DUALENTRY_ADVANCED.getRoute('1'));
    });

    it('clears the saved account when None is saved', () => {
        // Given: a fee account is already saved.
        renderPicker({fxExpenseAccountID: BANK_FEES_ACCOUNT.id});

        // When: None is selected and Save is pressed.
        act(() => {
            getSelectionScreenProps().onSelectRow({value: '', text: 'common.none', keyForList: CONST.SEARCH.NONE_OPTION_KEY, isSelected: false});
        });
        act(() => {
            getSelectionScreenProps().confirmButtonOptions?.onConfirm?.();
        });

        // Then: the setting is cleared so the cost stops being exported.
        expect(updateDualEntryFxExpenseAccount).toHaveBeenCalledWith('1', '', BANK_FEES_ACCOUNT.id);
    });

    it('blocks the picker while reimbursed reports are not synced', () => {
        // Given: Sync reimbursed reports is off, so no bill payment is posted for the cost to follow.
        // When: the picker is opened, for example from a deep link.
        const selectionScreenProps = renderPicker({syncReimbursedReports: false});

        // Then: the picker is blocked, matching the hidden Advanced row.
        expect(selectionScreenProps.shouldBeBlocked).toBe(true);
    });
    it('returns to its own Advanced page without saving when Back is pressed', () => {
        // Given an account has been selected without saving it.
        renderPicker();
        act(() => {
            getSelectionScreenProps().onSelectRow({value: BANK_FEES_ACCOUNT.id, text: BANK_FEES_ACCOUNT.name, keyForList: BANK_FEES_ACCOUNT.id});
        });

        // When Back is pressed in the shared picker.
        act(() => {
            getSelectionScreenProps().onBackButtonPress?.();
        });

        // Then the integration's Advanced route is preserved and nothing is persisted.
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_DUALENTRY_ADVANCED.getRoute('1'));
        expect(updateDualEntryFxExpenseAccount).not.toHaveBeenCalled();
    });
});

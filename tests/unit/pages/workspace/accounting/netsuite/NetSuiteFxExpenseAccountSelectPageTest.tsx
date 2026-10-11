import {act, render} from '@testing-library/react-native';

import SelectionScreen from '@components/SelectionScreen';

import {updateNetSuiteFxExpenseAccount} from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {ComponentType} from 'react';

import React from 'react';

import createMock from '../../../../../utils/createMock';

jest.mock('@pages/workspace/withPolicyConnections', () => (Component: ComponentType) => Component);

const NetSuiteFxExpenseAccountSelectPage = require<{default: ComponentType<{policy: Policy}>}>('@pages/workspace/accounting/netsuite/advanced/NetSuiteFxExpenseAccountSelectPage').default;

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

jest.mock('@libs/actions/connections/NetSuiteCommands', () => ({
    updateNetSuiteFxExpenseAccount: jest.fn(),
}));

jest.mock('@userActions/Policy/Policy', () => ({
    clearNetSuiteErrorField: jest.fn(),
}));

jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: jest.fn(() => false)},
}));

const TRAVEL_ACCOUNT = {id: 'a1', name: 'Travel'};

function buildPolicy({fxExpenseAccount, expenseAccounts = []}: {fxExpenseAccount?: string; expenseAccounts?: Array<{id: string; name: string}>} = {}): Policy {
    return createMock<Policy>({
        id: '1',
        connections: {
            netsuite: {
                options: {
                    config: {fxExpenseAccount},
                    data: {expenseAccounts},
                },
            },
        },
    });
}

function renderPicker(config: Parameters<typeof buildPolicy>[0] = {}) {
    render(<NetSuiteFxExpenseAccountSelectPage policy={buildPolicy(config)} />);
    return getSelectionScreenProps();
}

function getSelectionScreenProps() {
    const selectionScreenProps = jest.mocked(SelectionScreen).mock.calls.at(-1)?.[0];
    if (!selectionScreenProps) {
        throw new Error('Expected SelectionScreen to render');
    }
    return selectionScreenProps;
}

describe('NetSuiteFxExpenseAccountSelectPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('puts None at the top, selected, when no account is saved', () => {
        // Given: synced NetSuite expense accounts and no saved fee account.
        // When: the picker is opened.
        const selectionScreenProps = renderPicker({expenseAccounts: [TRAVEL_ACCOUNT]});

        // Then: None is first and selected, so the Advanced row stays empty.
        expect(selectionScreenProps.data.at(0)).toEqual(
            expect.objectContaining({
                value: '',
                text: 'common.none',
                keyForList: CONST.SEARCH.NONE_OPTION_KEY,
                isSelected: true,
            }),
        );
        expect(selectionScreenProps.confirmButtonOptions?.isDisabled).toBe(true);
    });

    it('does not persist until Save is pressed', () => {
        // Given: the picker is open with unsaved None selected.
        renderPicker({expenseAccounts: [TRAVEL_ACCOUNT]});

        // When: an account is tapped.
        act(() => {
            getSelectionScreenProps().onSelectRow({value: TRAVEL_ACCOUNT.id, text: TRAVEL_ACCOUNT.name, keyForList: TRAVEL_ACCOUNT.id, isSelected: false});
        });

        // Then: nothing is written and we stay on the picker.
        expect(updateNetSuiteFxExpenseAccount).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(getSelectionScreenProps().confirmButtonOptions?.isDisabled).toBe(false);
    });

    it('saves the selected account when Save is pressed', () => {
        // Given: an account has been tapped but not saved.
        renderPicker({expenseAccounts: [TRAVEL_ACCOUNT]});
        act(() => {
            getSelectionScreenProps().onSelectRow({value: TRAVEL_ACCOUNT.id, text: TRAVEL_ACCOUNT.name, keyForList: TRAVEL_ACCOUNT.id, isSelected: false});
        });

        // When: Save is pressed.
        act(() => {
            getSelectionScreenProps().confirmButtonOptions?.onConfirm?.();
        });

        // Then: the account is written and we return to Advanced.
        expect(updateNetSuiteFxExpenseAccount).toHaveBeenCalledWith('1', TRAVEL_ACCOUNT.id, undefined);
        expect(Navigation.goBack).toHaveBeenCalled();
    });

    it('clears the saved account when None is saved', () => {
        // Given: a fee account is already saved.
        renderPicker({fxExpenseAccount: TRAVEL_ACCOUNT.id, expenseAccounts: [TRAVEL_ACCOUNT]});

        // When: None is selected and Save is pressed.
        act(() => {
            getSelectionScreenProps().onSelectRow({value: '', text: 'common.none', keyForList: CONST.SEARCH.NONE_OPTION_KEY, isSelected: false});
        });
        act(() => {
            getSelectionScreenProps().confirmButtonOptions?.onConfirm?.();
        });

        // Then: the setting is cleared so the cost stays off the journal entry.
        expect(updateNetSuiteFxExpenseAccount).toHaveBeenCalledWith('1', '', TRAVEL_ACCOUNT.id);
        expect(Navigation.goBack).toHaveBeenCalled();
    });
});

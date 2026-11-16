import {render} from '@testing-library/react-native';

import ColumnsSettingsList from '@components/ColumnsSettingsList';

import useOnyx from '@hooks/useOnyx';

import {setReportDetailsColumns} from '@libs/actions/ReportLayout';
import Navigation from '@libs/Navigation/Navigation';

import ReportDetailsColumnsPage from '@pages/settings/Report/ReportDetailsColumnsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import {useRoute} from '@react-navigation/native';
import React from 'react';

import {transactionR14932} from '../../../../__mocks__/reportData/transactions';

jest.mock('@components/ColumnsSettingsList', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: jest.fn(() => false)}}));
jest.mock('@libs/actions/ReportLayout', () => ({setReportDetailsColumns: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@react-navigation/native', () => ({...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'), useRoute: jest.fn()}));

const COLUMNS = CONST.SEARCH.TABLE_COLUMNS;
const REPORT_ID = 'report-1';
let mockSavedColumns: string[] | undefined;
let mockTransactions: Record<string, Transaction>;

function renderColumns(savedColumns: string[] | undefined, isExpenseView?: string, transactions: Record<string, Transaction> = {}) {
    mockSavedColumns = savedColumns;
    mockTransactions = transactions;
    jest.mocked(useRoute).mockReturnValue({key: 'columns', name: 'columns', params: {reportID: REPORT_ID, isExpenseView}});
    render(<ReportDetailsColumnsPage />);
    const props = jest.mocked(ColumnsSettingsList).mock.calls.at(-1)?.at(0);
    if (!props) {
        throw new Error('Expected the rendered columns-list boundary');
    }
    return props;
}

beforeEach(() => {
    jest.clearAllMocks();
});

jest.mocked(useOnyx).mockImplementation((key) => {
    switch (key) {
        case ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS:
            return [mockSavedColumns, {status: 'loaded'}];
        case ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS:
            return [mockTransactions, {status: 'loaded'}];
        default:
            return [undefined, {status: 'loaded'}];
    }
});
it('filters unsupported saved columns, defaults invalid-only storage, and preserves save behavior', () => {
    // Given a report column picker that may open with obsolete entries in the stored preference.
    const mixedProps = renderColumns(['invalid', COLUMNS.MERCHANT, 'foreign', COLUMNS.DATE]);
    const defaultProps = renderColumns(['invalid', 'foreign']);
    const savedColumns = [COLUMNS.DATE, COLUMNS.TOTAL_AMOUNT];
    const props = renderColumns(savedColumns);

    // When the user saves an unchanged selection, then makes a different choice.
    props.onSave(savedColumns);
    props.onSave([COLUMNS.MERCHANT, COLUMNS.TOTAL_AMOUNT]);

    // Then obsolete entries stay out of the picker, and only the changed choice is persisted.
    expect(mixedProps.currentColumns).toEqual([COLUMNS.MERCHANT, COLUMNS.DATE]);
    expect(defaultProps.currentColumns).toEqual(defaultProps.defaultSelectedColumns);
    expect(defaultProps.currentColumns).toContain(COLUMNS.TOTAL_AMOUNT);
    expect(props.currentColumns).toEqual(savedColumns);
    expect(setReportDetailsColumns).toHaveBeenCalledTimes(1);
    expect(setReportDetailsColumns).toHaveBeenCalledWith([COLUMNS.MERCHANT, COLUMNS.TOTAL_AMOUNT], savedColumns);
    expect(Navigation.goBack).toHaveBeenCalledTimes(2);
});

it('preselects the report column defaults when opening Customize fields without a saved preference', () => {
    // Given a user who has never saved a column preference.
    const defaultColumns = [COLUMNS.RECEIPT, COLUMNS.DATE, COLUMNS.MERCHANT, COLUMNS.CATEGORY, COLUMNS.TAG, COLUMNS.TOTAL_AMOUNT];

    // When the user opens the picker from the report table and from an expense.
    const reportPicker = renderColumns(undefined);
    const expensePicker = renderColumns(undefined, 'true');

    // Then both entry points allow the same choices and show the same checked and required columns.
    expect(expensePicker.allColumns).toEqual(reportPicker.allColumns);
    expect(expensePicker.currentColumns).toEqual(defaultColumns);
    expect(expensePicker.defaultSelectedColumns).toEqual(defaultColumns);
    expect(expensePicker.requiredColumns).toEqual(new Set([COLUMNS.TOTAL_AMOUNT]));
    expect(expensePicker.title).toBe('iou.customizeFields');
    expect(expensePicker.resetText).toBe('search.resetFields');
});

it('includes data-driven defaults from the containing report in Customize fields', () => {
    // Given no saved preference and a visible expense on the containing report with an MCC value.
    const expense = {...transactionR14932, reportID: REPORT_ID, mcc: 5812};
    const transactions = {[expense.transactionID]: expense};

    // When the user opens the picker from the expense and saves without edits.
    const reportPicker = renderColumns(undefined, undefined, transactions);
    const expensePicker = renderColumns(undefined, 'true', transactions);
    expensePicker.onSave(expensePicker.currentColumns);

    // Then MCC is initially selected alongside the report's other columns, without replacing the defaults with a saved preference.
    expect(expensePicker.currentColumns).toEqual(reportPicker.currentColumns);
    expect(expensePicker.currentColumns).toEqual(expect.arrayContaining([COLUMNS.RECEIPT, COLUMNS.DATE, COLUMNS.MERCHANT, COLUMNS.MCC, COLUMNS.TOTAL_AMOUNT]));
    expect(setReportDetailsColumns).not.toHaveBeenCalled();
});

it('saves changes to standard columns and extra fields from Customize fields', () => {
    // Given a preference that includes both standard columns and an extra field.
    const savedColumns = [COLUMNS.RECEIPT, COLUMNS.DATE, COLUMNS.MCC, COLUMNS.MERCHANT, COLUMNS.TOTAL_AMOUNT];
    const expensePicker = renderColumns(savedColumns, 'true');

    // When the user deselects Receipt and moves Merchant to the first position before saving.
    const updatedColumns = [COLUMNS.MERCHANT, COLUMNS.DATE, COLUMNS.MCC, COLUMNS.TOTAL_AMOUNT];
    expensePicker.onSave(updatedColumns);

    // Then the picker reflects the saved order and writes the full updated selection to the shared preference.
    expect(expensePicker.currentColumns).toEqual(savedColumns);
    expect(setReportDetailsColumns).toHaveBeenCalledWith(updatedColumns, savedColumns);
    expect(Navigation.goBack).toHaveBeenCalledTimes(1);
});

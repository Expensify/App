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
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
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

it('updates additional fields in place in the shared report preference', () => {
    // Given an account-wide preference with Vendor selected on another workspace and custom fields between the table columns.
    const savedColumns = [COLUMNS.DATE, COLUMNS.MCC, COLUMNS.VENDOR, COLUMNS.CATEGORY_GL_CODE, COLUMNS.MERCHANT, COLUMNS.TOTAL_AMOUNT];

    // When the user reorders the extra fields and adds Purchase amount from an expense.
    const props = renderColumns(savedColumns, 'true');
    props.onSave([COLUMNS.CATEGORY_GL_CODE, COLUMNS.MCC, COLUMNS.ORIGINAL_AMOUNT]);

    // Then the picker only manages additional fields and keeps the saved layout of the other columns.
    expect(props.title).toBe('iou.customizeFields');
    expect(props.resetText).toBe('search.resetFields');
    expect(props.defaultSelectedColumns).toEqual([]);
    expect(props.currentColumns).toEqual([COLUMNS.MCC, COLUMNS.CATEGORY_GL_CODE]);
    expect(props.allColumns).toEqual(expect.arrayContaining([COLUMNS.MCC, COLUMNS.CATEGORY_GL_CODE, COLUMNS.ORIGINAL_AMOUNT]));
    expect(props.allColumns).not.toContain(COLUMNS.DATE);
    expect(props.allColumns).not.toContain(COLUMNS.VENDOR);
    expect(props.requiredColumns.size).toBe(0);
    expect(setReportDetailsColumns).toHaveBeenCalledWith(
        [COLUMNS.DATE, COLUMNS.CATEGORY_GL_CODE, COLUMNS.VENDOR, COLUMNS.MCC, COLUMNS.MERCHANT, COLUMNS.TOTAL_AMOUNT, COLUMNS.ORIGINAL_AMOUNT],
        savedColumns,
    );
    expect(Navigation.goBack).toHaveBeenCalledTimes(1);
});

it('seeds the picker from the containing report and keeps its other default columns', () => {
    // Given no saved preference and a visible expense on the containing report with an MCC value.
    const expense = {...transactionR14932, reportID: REPORT_ID, mcc: 5812};

    // When the user clears that automatically selected field.
    const props = renderColumns(undefined, 'true', {[expense.transactionID]: expense});
    props.onSave([]);

    // Then the initial picker reflects the report and saving omits the field while preserving its other table columns.
    expect(props.currentColumns).toEqual([COLUMNS.MCC]);
    expect(setReportDetailsColumns).toHaveBeenCalledWith([COLUMNS.RECEIPT, COLUMNS.DATE, COLUMNS.MERCHANT, COLUMNS.TOTAL_AMOUNT], undefined);
});

it('keeps an explicit preference after clearing the last extra field', () => {
    // Given an older preference whose only other selection is unavailable on this workspace.
    const savedColumns = [COLUMNS.VENDOR, COLUMNS.MCC];
    const props = renderColumns(savedColumns, 'true');

    // When the user clears the final additional field and saves.
    props.onSave([]);

    // Then the required table column keeps the view from falling back to its automatically selected fields.
    expect(setReportDetailsColumns).toHaveBeenCalledWith([COLUMNS.VENDOR, COLUMNS.TOTAL_AMOUNT], savedColumns);
});

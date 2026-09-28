import {render} from '@testing-library/react-native';

import ColumnsSettingsList from '@components/ColumnsSettingsList';

import useOnyx from '@hooks/useOnyx';

import {setReportDetailsColumns} from '@libs/actions/ReportLayout';
import Navigation from '@libs/Navigation/Navigation';

import ReportDetailsColumnsPage from '@pages/settings/Report/ReportDetailsColumnsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigation from '@react-navigation/native';

import {useRoute} from '@react-navigation/native';
import React from 'react';

jest.mock('@components/ColumnsSettingsList', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1})));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: jest.fn(() => false)}}));
jest.mock('@libs/actions/ReportLayout', () => ({setReportDetailsColumns: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@react-navigation/native', () => ({...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'), useRoute: jest.fn()}));
let mockSavedColumns: string[] | undefined;
function renderColumns(savedColumns: string[] | undefined) {
    mockSavedColumns = savedColumns;
    render(<ReportDetailsColumnsPage />);
    const props = jest.mocked(ColumnsSettingsList).mock.calls.at(-1)?.at(0);
    if (!props) {
        throw new Error('Expected the rendered columns-list boundary');
    }
    return props;
}
jest.mocked(useRoute).mockReturnValue({key: 'columns', name: 'columns', params: {reportID: 'report-1'}});
jest.mocked(useOnyx).mockImplementation((key) => {
    switch (key) {
        case ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS:
            return [mockSavedColumns, {status: 'loaded'}];
        case ONYXKEYS.COLLECTION.TRANSACTION:
            return [[], {status: 'loaded'}];
        default:
            return [undefined, {status: 'loaded'}];
    }
});
it('filters unsupported saved columns, defaults invalid-only storage, and preserves save behavior', () => {
    const mixedProps = renderColumns(['invalid', CONST.SEARCH.TABLE_COLUMNS.MERCHANT, 'foreign', CONST.SEARCH.TABLE_COLUMNS.DATE]);
    expect(mixedProps.currentColumns).toEqual([CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.DATE]);
    const defaultProps = renderColumns(['invalid', 'foreign']);
    expect([defaultProps.currentColumns, defaultProps.currentColumns.includes(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT)]).toEqual([defaultProps.defaultSelectedColumns, true]);
    const savedColumns = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT];
    const props = renderColumns(savedColumns);
    expect([props.currentColumns, jest.mocked(setReportDetailsColumns).mock.calls.length]).toEqual([mockSavedColumns, 0]);
    props.onSave(savedColumns);
    props.onSave([CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);
    expect(jest.mocked(setReportDetailsColumns)).toHaveBeenCalledWith([CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT], mockSavedColumns);
    expect(jest.mocked(Navigation.goBack)).toHaveBeenCalledTimes(2);
});

it('uses the expense heading while saving the same report column preference', () => {
    // Given the picker opened through an expense's Customize fields action.
    jest.mocked(useRoute).mockReturnValue({key: 'columns', name: SCREENS.REPORT_SETTINGS.FIELDS, params: {reportID: 'report-1'}});
    const savedColumns = [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.MERCHANT];

    // When the user adds an accounting field and saves.
    const props = renderColumns(savedColumns);
    const selectedColumns = [...savedColumns, CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE];
    props.onSave(selectedColumns);

    // Then the heading matches the entry point and the existing NVP action receives the new selection and rollback value.
    expect(props.titleKey).toBe('search.customizeFields');
    expect(setReportDetailsColumns).toHaveBeenLastCalledWith(selectedColumns, savedColumns);
});

it.each([
    [
        [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.RECEIPT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT],
        [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.RECEIPT, CONST.SEARCH.TABLE_COLUMNS.MCC],
    ],
    [
        [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT],
        [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.MCC],
    ],
])('preserves the table receipt preference when saving fields (%j)', (savedColumns, expectedColumns) => {
    // Given a table with its receipt column either enabled in a custom position or disabled.
    jest.mocked(useRoute).mockReturnValue({key: 'fields', name: SCREENS.REPORT_SETTINGS.FIELDS, params: {reportID: 'report-1'}});
    const props = renderColumns(savedColumns);

    // When only the expense fields are customized.
    props.onSave([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.MCC]);

    // Then the receipt stays outside the field picker and its table preference survives.
    expect(props.allColumns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.RECEIPT);
    expect(props.currentColumns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.RECEIPT);
    expect(setReportDetailsColumns).toHaveBeenLastCalledWith(expectedColumns, savedColumns);
});

it('preserves untouched expense defaults and keeps the default receipt column on the first save', () => {
    // Given an account that has never customized report columns.
    jest.mocked(useRoute).mockReturnValue({key: 'fields', name: SCREENS.REPORT_SETTINGS.FIELDS, params: {reportID: 'report-1'}});
    const props = renderColumns(undefined);
    const previousCallCount = jest.mocked(setReportDetailsColumns).mock.calls.length;

    // When the picker is saved without any change.
    props.onSave(props.currentColumns);

    // Then it leaves the default rendering intact, with amount first even when resetting fields.
    expect(setReportDetailsColumns).toHaveBeenCalledTimes(previousCallCount);
    expect(props.currentColumns.at(0)).toBe(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT);
    expect(props.allColumns.filter((column) => props.defaultSelectedColumns.includes(column))).toEqual(props.currentColumns);

    // When the first actual customization is saved.
    props.onSave([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE]);

    // Then the table retains its default receipt column.
    expect(setReportDetailsColumns).toHaveBeenLastCalledWith(
        [CONST.SEARCH.TABLE_COLUMNS.RECEIPT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE],
        undefined,
    );
});

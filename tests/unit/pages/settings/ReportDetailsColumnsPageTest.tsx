import {render} from '@testing-library/react-native';

import ColumnsSettingsList from '@components/ColumnsSettingsList';

import useOnyx from '@hooks/useOnyx';

import {setReportDetailsColumns} from '@libs/actions/ReportLayout';
import Navigation from '@libs/Navigation/Navigation';

import ReportDetailsColumnsPage from '@pages/settings/Report/ReportDetailsColumnsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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
    jest.mocked(useRoute).mockReturnValue({key: 'columns', name: 'columns', params: {reportID: 'report-1', isExpenseView: true}});
    const savedColumns = [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.MERCHANT];

    // When the user adds an accounting field and saves.
    const props = renderColumns(savedColumns);
    const selectedColumns = [...savedColumns, CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE];
    props.onSave(selectedColumns);

    // Then the heading matches the entry point and the existing NVP action receives the new selection and rollback value.
    expect(props.titleKey).toBe('search.customizeFields');
    expect(setReportDetailsColumns).toHaveBeenLastCalledWith(selectedColumns, savedColumns);
});

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
let mockIsCustomizeFields = false;
function renderColumns(savedColumns: string[] | undefined) {
    mockSavedColumns = savedColumns;
    render(<ReportDetailsColumnsPage />);
    const props = jest.mocked(ColumnsSettingsList).mock.calls.at(-1)?.at(0);
    if (!props) {
        throw new Error('Expected the rendered columns-list boundary');
    }
    return props;
}
jest.mocked(useRoute).mockImplementation(() => ({key: 'columns', name: 'columns', params: {reportID: 'report-1', isCustomizeFields: mockIsCustomizeFields}}));
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

it('does not overwrite a hidden workspace column when saving unchanged required fields', () => {
    // Given an account-wide preference that includes Vendor, while this workspace cannot offer Vendor in its picker.
    mockIsCustomizeFields = true;
    mockSavedColumns = [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.VENDOR];
    jest.mocked(setReportDetailsColumns).mockClear();

    // When Customize fields saves its unchanged selection, including required fields absent from the saved preference.
    const props = renderColumns(mockSavedColumns);
    props.onSave([CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);

    // Then the shared preference is left untouched so the other workspace's Vendor column is preserved.
    expect(jest.mocked(setReportDetailsColumns)).not.toHaveBeenCalled();
    mockIsCustomizeFields = false;
});

it('preserves a hidden workspace column when another field is changed', () => {
    // Given an account-wide preference that includes Vendor, while this workspace cannot offer Vendor in its picker.
    mockIsCustomizeFields = true;
    const savedColumns = [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.VENDOR];
    jest.mocked(setReportDetailsColumns).mockClear();

    // When the user adds MCC and saves Customize fields with its required fields selected.
    const props = renderColumns(savedColumns);
    props.onSave([CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.MCC]);

    // Then the new selection is saved without losing Vendor from the shared preference.
    expect(jest.mocked(setReportDetailsColumns)).toHaveBeenCalledWith(
        [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.VENDOR, CONST.SEARCH.TABLE_COLUMNS.MCC],
        savedColumns,
    );
    mockIsCustomizeFields = false;
});

it('preserves one receipt column and an unavailable workspace column when saving', () => {
    // Given a shared preference with Receipt and Vendor, neither of which can be selected in this workspace's picker.
    mockIsCustomizeFields = true;
    const savedColumns = [CONST.SEARCH.TABLE_COLUMNS.VENDOR, CONST.SEARCH.TABLE_COLUMNS.RECEIPT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT];
    jest.mocked(setReportDetailsColumns).mockClear();

    // When the user adds MCC and saves Customize fields.
    const props = renderColumns(savedColumns);
    props.onSave([CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.MCC]);

    // Then Receipt and Vendor each remain exactly once in the shared preference.
    expect(jest.mocked(setReportDetailsColumns)).toHaveBeenCalledWith(
        [CONST.SEARCH.TABLE_COLUMNS.VENDOR, CONST.SEARCH.TABLE_COLUMNS.RECEIPT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.MCC],
        savedColumns,
    );
    mockIsCustomizeFields = false;
});

it('keeps Receipt at the beginning when saving the first custom field selection', () => {
    // Given the default report columns and no saved customization.
    mockIsCustomizeFields = true;
    mockSavedColumns = undefined;
    jest.mocked(setReportDetailsColumns).mockClear();

    // When the user adds MCC and saves Customize fields for the first time.
    const props = renderColumns(undefined);
    props.onSave([
        CONST.SEARCH.TABLE_COLUMNS.DATE,
        CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
        CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
        CONST.SEARCH.TABLE_COLUMNS.TAG,
        CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        CONST.SEARCH.TABLE_COLUMNS.MCC,
    ]);

    // Then Receipt stays in its default first position in the shared preference.
    expect(jest.mocked(setReportDetailsColumns)).toHaveBeenCalledWith(
        [
            CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
            CONST.SEARCH.TABLE_COLUMNS.DATE,
            CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
            CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
            CONST.SEARCH.TABLE_COLUMNS.TAG,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
            CONST.SEARCH.TABLE_COLUMNS.MCC,
        ],
        undefined,
    );
    mockIsCustomizeFields = false;
});

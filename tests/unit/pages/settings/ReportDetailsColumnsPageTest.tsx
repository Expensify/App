import {fireEvent, render, screen} from '@testing-library/react-native';

import ColumnsSettingsList from '@components/ColumnsSettingsList';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportTransactions from '@hooks/useReportTransactions';

import {setReportDetailsColumns} from '@libs/actions/ReportLayout';
import getMoneyRequestViewFields from '@libs/getMoneyRequestViewFields';
import Navigation from '@libs/Navigation/Navigation';

import ReportDetailsColumnsPage from '@pages/settings/Report/ReportDetailsColumnsPage';

import {setNameValuePair} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import {Button, View as MockView} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../../../utils/createMock';

jest.mock('@components/ColumnsSettingsList', () => jest.fn(() => null));
jest.mock('@components/FullscreenLoadingIndicator', () => () => <MockView testID="report-fields-loading" />);
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1})));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePermissions', () => jest.fn());
jest.mock('@hooks/useReportTransactions', () => jest.fn());
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: jest.fn(() => false)},
}));
jest.mock('@libs/actions/ReportLayout', () => ({setReportDetailsColumns: jest.fn()}));
jest.mock('@userActions/User', () => ({setNameValuePair: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useRoute: jest.fn(),
}));

const {TOTAL_AMOUNT, DESCRIPTION, MERCHANT, DATE, CATEGORY_GL_CODE, ATTENDEES, RECEIPT, HELD, POSTED, TOTAL_PER_ATTENDEE, MCC, VENDOR} = CONST.SEARCH.TABLE_COLUMNS;

type PreferenceValues = [string[] | undefined, string | undefined];
const mockReadPreferences = jest.fn<Promise<PreferenceValues>, []>();
let mockSavedColumns: string[] | undefined;
let mockSavedColumnsStatus: 'loading' | 'loaded' = 'loaded';
let mockExpenseFields: string | undefined;
let mockExpenseFieldsStatus: 'loading' | 'loaded' = 'loaded';
let mockReportTransactions: Transaction[] = [];
let mockAreReportTransactionsReady = true;
let mockReport: Report | undefined;
let mockPolicy: Policy | undefined;
let mockReportStatus: 'loading' | 'loaded' = 'loaded';
let mockPolicyStatus: 'loading' | 'loaded' = 'loaded';
let mockVendorBeta: boolean | undefined = false;

function renderColumns(savedColumns?: string[], expenseFields?: string) {
    mockSavedColumns = savedColumns;
    mockExpenseFields = expenseFields;
    render(<ReportDetailsColumnsPage />);
    const props = jest.mocked(ColumnsSettingsList).mock.calls.at(-1)?.at(0);
    if (!props) {
        throw new Error('Expected the rendered columns list');
    }
    return props;
}

function renderFields(savedColumns?: string[], expenseFields?: string) {
    jest.mocked(useRoute).mockReturnValue({key: 'fields', name: SCREENS.REPORT_SETTINGS.FIELDS, params: {reportID: 'report-1'}});
    return renderColumns(savedColumns, expenseFields);
}

jest.mocked(useOnyx).mockImplementation((key) => {
    switch (key) {
        case ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS:
            return [mockSavedColumns, {status: mockSavedColumnsStatus}];
        case ONYXKEYS.NVP_EXPENSE_FIELDS:
            return [mockExpenseFields, {status: mockExpenseFieldsStatus}];
        case ONYXKEYS.COLLECTION.TRANSACTION:
            return [mockReportTransactions, {status: 'loaded'}];
        case ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS:
            return [mockAreReportTransactionsReady, {status: 'loaded'}];
        case `${ONYXKEYS.COLLECTION.REPORT}report-1`:
            return [mockReport, {status: mockReportStatus}];
        case `${ONYXKEYS.COLLECTION.POLICY}policy-1`:
            return [mockPolicy, {status: mockPolicyStatus}];
        default:
            return [undefined, {status: 'loaded'}];
    }
});

function MockPicker(props: Parameters<typeof ColumnsSettingsList>[0]) {
    const [selection] = React.useState(props.currentColumns);
    const [availableColumns] = React.useState(props.allColumns);
    return (
        <MockView>
            {availableColumns.includes(VENDOR) && <MockView testID="vendor-option" />}
            <Button
                title="Save fields"
                onPress={() => {
                    props.onSave(selection);
                }}
            />
        </MockView>
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(ColumnsSettingsList).mockImplementation(() => <MockView />);
    mockReadPreferences.mockImplementation(async () => [mockSavedColumns, mockExpenseFields]);
    jest.spyOn(Onyx, 'multiGet').mockImplementation(mockReadPreferences);
    mockSavedColumns = undefined;
    mockExpenseFields = undefined;
    mockExpenseFieldsStatus = 'loaded';
    mockSavedColumnsStatus = 'loaded';
    mockReportTransactions = [];
    mockAreReportTransactionsReady = true;
    jest.mocked(useReportTransactions).mockImplementation(() => mockReportTransactions);
    mockReport = undefined;
    mockPolicy = undefined;
    mockReportStatus = 'loaded';
    mockPolicyStatus = 'loaded';
    mockVendorBeta = false;
    jest.mocked(usePermissions).mockImplementation(() => ({isBetaEnabled: () => mockVendorBeta ?? false, isBetaEnabledOrUnknown: () => mockVendorBeta}));
    jest.mocked(useRoute).mockReturnValue({key: 'columns', name: SCREENS.REPORT_SETTINGS.COLUMNS, params: {reportID: 'report-1'}});
});

it('ignores saved columns that are no longer supported', () => {
    // Given a table preference containing columns from another table or an older app version.
    const savedColumns = ['invalid', MERCHANT, 'foreign', DATE];

    // When the user opens their table column preferences.
    const props = renderColumns(savedColumns);

    // Then supported columns keep their saved order without exposing unavailable choices.
    expect(props.currentColumns).toEqual([MERCHANT, DATE]);
});

it('uses table defaults when none of the saved columns are supported', () => {
    // Given an old table preference with no available columns.
    const savedColumns = ['invalid', 'foreign'];

    // When the user opens their table column preferences.
    const props = renderColumns(savedColumns);

    // Then the table picker stays usable with its default selection and required Amount.
    expect(props.currentColumns).toEqual(props.defaultSelectedColumns);
    expect(props.currentColumns).toContain(TOTAL_AMOUNT);
});

it('saves table columns with their previous value for rollback', async () => {
    // Given a table selection that must survive if the save request fails.
    const savedColumns = [DATE, TOTAL_AMOUNT];
    const expenseFields = JSON.stringify([TOTAL_AMOUNT, DESCRIPTION]);
    const props = renderColumns(savedColumns, expenseFields);
    const selectedColumns = [MERCHANT, TOTAL_AMOUNT];

    // When the user changes the table selection.
    await props.onSave(selectedColumns);

    // Then only the table preference changes, with its old value available for rollback.
    expect(setReportDetailsColumns).toHaveBeenCalledWith(selectedColumns, savedColumns);
    expect(setNameValuePair).not.toHaveBeenCalled();
    expect(Navigation.goBack).toHaveBeenCalledTimes(1);
});

it('keeps the table automatic column selection when saved without edits', async () => {
    // Given an expense whose MCC automatically appears in the table without a saved preference.
    mockReportTransactions = [{transactionID: 'transaction-1', reportID: 'report-1', amount: 1000, currency: 'USD', created: '2026-10-29', merchant: 'Market', mcc: '5411'}];
    const props = renderColumns();

    // When the user saves the existing table selection.
    await props.onSave(props.currentColumns);

    // Then no explicit preference replaces the automatic column behavior.
    expect(props.currentColumns).toContain(MCC);
    expect(setReportDetailsColumns).not.toHaveBeenCalled();
    expect(setNameValuePair).not.toHaveBeenCalled();
});

it('shows the same initial selection as the expense view', () => {
    // Given a user who has never customized the expense fields.
    const props = renderFields();

    // When the expense and its picker resolve the initial selection.
    const fieldsInExpense = getMoneyRequestViewFields();

    // Then visible fields are selected, including the editors absent from table defaults.
    expect(props.titleKey).toBe('search.customizeFields');
    expect(props.currentColumns).toEqual(fieldsInExpense.filter((column) => column !== VENDOR));
    expect(props.currentColumns).toContain(DESCRIPTION);
    expect(props.currentColumns).toContain(ATTENDEES);
});

it('waits for the current preferences before writing an edited selection', async () => {
    // Given a preference read still waiting for Onyx initialization.
    const pendingRead = Promise.withResolvers<PreferenceValues>();
    mockReadPreferences.mockReturnValueOnce(pendingRead.promise);
    const props = renderFields();

    // When the user saves before the read has completed.
    const saving = props.onSave([TOTAL_AMOUNT, DESCRIPTION]);
    expect(setNameValuePair).not.toHaveBeenCalled();
    expect(Navigation.goBack).not.toHaveBeenCalled();
    pendingRead.resolve([undefined, undefined]);
    await saving;

    // Then the selection is written only after the current preference is known.
    expect(setNameValuePair).toHaveBeenCalledTimes(1);
    expect(Navigation.goBack).toHaveBeenCalledTimes(1);
});

it('does not overwrite an expense preference that arrives after the picker renders', async () => {
    // Given a picker initialized before an existing preference becomes available.
    const props = renderFields();
    const existingFields = JSON.stringify([TOTAL_AMOUNT, MCC]);
    mockReadPreferences.mockResolvedValueOnce([undefined, existingFields]);

    // When the user saves a change based on the earlier default selection.
    await props.onSave([TOTAL_AMOUNT, DESCRIPTION]);

    // Then the existing preference is preserved and the picker stays open to receive the updated selection.
    expect(setNameValuePair).not.toHaveBeenCalled();
    expect(Navigation.goBack).not.toHaveBeenCalled();
});

it.each([SCREENS.REPORT_SETTINGS.COLUMNS, SCREENS.REPORT_SETTINGS.FIELDS])('preserves table preferences that change while %s is open', async (screenName) => {
    // Given a picker whose table preference has changed since it was rendered.
    jest.mocked(useRoute).mockReturnValue({key: 'columns', name: screenName, params: {reportID: 'report-1'}});
    const props = renderColumns();
    mockReadPreferences.mockResolvedValueOnce([[DATE, MCC, TOTAL_AMOUNT], undefined]);

    // When an edit is saved from the stale selection.
    await props.onSave([TOTAL_AMOUNT, MERCHANT]);

    // Then neither preference is overwritten and the updated selection can arrive through the subscription.
    expect(setReportDetailsColumns).not.toHaveBeenCalled();
    expect(setNameValuePair).not.toHaveBeenCalled();
    expect(Navigation.goBack).not.toHaveBeenCalled();
});

it('waits for transaction initialization before offering automatic table columns', async () => {
    // Given a report whose transactions have not reached the derived key yet.
    mockSavedColumns = undefined;
    mockAreReportTransactionsReady = false;
    const {rerender} = render(<ReportDetailsColumnsPage />);
    expect(screen.getByTestId('report-fields-loading')).toBeOnTheScreen();
    expect(ColumnsSettingsList).not.toHaveBeenCalled();

    // When the report transactions arrive with an MCC column that should be selected automatically.
    mockReportTransactions = [{transactionID: 'transaction-1', reportID: 'report-1', amount: 1000, currency: 'USD', created: '2026-10-29', merchant: 'Market', mcc: '5411'}];
    mockAreReportTransactionsReady = true;
    rerender(<ReportDetailsColumnsPage />);
    const props = jest.mocked(ColumnsSettingsList).mock.calls.at(-1)?.at(0);
    await props?.onSave(props.currentColumns);

    // Then the first editable selection reflects transaction data and saving it keeps the automatic behavior.
    expect(props?.currentColumns).toContain(MCC);
    expect(setReportDetailsColumns).not.toHaveBeenCalled();
});

it('allows an initialized report with no transactions to use the default table columns', () => {
    // Given a loaded report with an empty transaction list, rather than a pending derived key.
    mockReportTransactions = [];
    mockAreReportTransactionsReady = true;

    // When the table picker opens.
    const props = renderColumns();

    // Then it remains usable with the default columns instead of waiting for a nonexistent transaction.
    expect(props.currentColumns).toEqual(props.defaultSelectedColumns);
    expect(screen.queryByTestId('report-fields-loading')).not.toBeOnTheScreen();
});

it('does not wait for transactions or expense preferences when the table selection is already saved', () => {
    // Given explicit table columns whose selection does not depend on expense preferences or transaction data.
    mockAreReportTransactionsReady = false;
    mockExpenseFieldsStatus = 'loading';

    // When the table picker opens before those unrelated values arrive.
    const props = renderColumns([DATE, TOTAL_AMOUNT]);

    // Then the saved table selection is available immediately.
    expect(props.currentColumns).toEqual([DATE, TOTAL_AMOUNT]);
});

it('adds an unselected Vendor option when workspace availability changes', () => {
    // Given a customized expense selection that omits Vendor before its workspace becomes available.
    mockExpenseFields = JSON.stringify([TOTAL_AMOUNT, DESCRIPTION]);
    mockReport = {reportID: 'report-1', policyID: 'policy-1'};
    jest.mocked(useRoute).mockReturnValue({key: 'fields', name: SCREENS.REPORT_SETTINGS.FIELDS, params: {reportID: 'report-1'}});
    jest.mocked(ColumnsSettingsList).mockImplementation(MockPicker);
    const {rerender} = render(<ReportDetailsColumnsPage />);
    expect(screen.queryByTestId('vendor-option')).not.toBeOnTheScreen();

    // When the workspace enables Vendor without changing the selected fields.
    mockPolicy = createMock<Policy>({id: 'policy-1', connections: {xero: {config: {isConfigured: true}}}});
    rerender(<ReportDetailsColumnsPage />);

    // Then the open picker offers Vendor as an unchecked option, without requiring navigation away and back.
    expect(screen.getByTestId('vendor-option')).toBeOnTheScreen();
    const props = jest.mocked(ColumnsSettingsList).mock.calls.at(-1)?.at(0);
    expect(props?.currentColumns).toEqual([TOTAL_AMOUNT, DESCRIPTION]);
});

it.each(['preference', 'report', 'policy', 'beta'] as const)('preserves Vendor when %s data loads after the expense preference', (pendingData) => {
    // Given a saved Vendor selection whose workspace availability is not known yet.
    const savedFields = [TOTAL_AMOUNT, VENDOR, DESCRIPTION];
    const report: Report = {reportID: 'report-1', policyID: 'policy-1'};
    const connection = pendingData === 'beta' ? CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL : CONST.POLICY.CONNECTIONS.NAME.XERO;
    const policy = createMock<Policy>({id: 'policy-1', connections: {[connection]: {config: {isConfigured: true}}}});
    mockExpenseFields = pendingData === 'preference' ? undefined : JSON.stringify(savedFields);
    mockReport = pendingData === 'report' ? undefined : report;
    mockPolicy = pendingData === 'policy' ? undefined : policy;
    mockReportStatus = pendingData === 'report' ? 'loading' : 'loaded';
    mockPolicyStatus = pendingData === 'policy' ? 'loading' : 'loaded';
    mockVendorBeta = pendingData === 'beta' ? undefined : false;
    jest.mocked(useRoute).mockReturnValue({key: 'fields', name: SCREENS.REPORT_SETTINGS.FIELDS, params: {reportID: 'report-1'}});
    jest.mocked(ColumnsSettingsList).mockImplementation(MockPicker);
    const {rerender} = render(<ReportDetailsColumnsPage />);

    // When the report, workspace and applicable beta finish loading.
    mockExpenseFields = JSON.stringify(savedFields);
    mockReport = report;
    mockPolicy = policy;
    mockReportStatus = 'loaded';
    mockPolicyStatus = 'loaded';
    mockVendorBeta = true;
    rerender(<ReportDetailsColumnsPage />);
    const props = jest.mocked(ColumnsSettingsList).mock.calls.at(-1)?.at(0);
    fireEvent.press(screen.getByText('Save fields'));

    // Then the first selection includes Vendor and saving without edits cannot erase it.
    expect(props?.currentColumns).toEqual(savedFields);
    expect(setNameValuePair).not.toHaveBeenCalled();
    expect(setReportDetailsColumns).not.toHaveBeenCalled();
    expect(Navigation.goBack).toHaveBeenCalledTimes(1);
});

it('adds an expense field without hiding existing editors or changing the table', async () => {
    // Given an expense with its usual fields and no saved table or expense preference.
    const props = renderFields();
    const selectedFields = [...props.currentColumns, CATEGORY_GL_CODE];
    const storedFields = [...getMoneyRequestViewFields(), CATEGORY_GL_CODE];

    // When the user adds only Category GL code and reopens the saved selection.
    await props.onSave(selectedFields);
    const savedPreference = jest.mocked(setNameValuePair).mock.calls.at(-1)?.at(1);
    const reopened = renderFields(undefined, typeof savedPreference === 'string' ? savedPreference : undefined);

    // Then the requested field is added while existing editors and the table remain intact.
    expect(setNameValuePair).toHaveBeenCalledWith(ONYXKEYS.NVP_EXPENSE_FIELDS, JSON.stringify(storedFields), '');
    expect(setReportDetailsColumns).not.toHaveBeenCalled();
    expect(reopened.currentColumns).toEqual(selectedFields);
    expect(reopened.currentColumns).toContain(DESCRIPTION);
    expect(reopened.currentColumns).toContain(ATTENDEES);
    expect(getMoneyRequestViewFields([], JSON.stringify(storedFields)).filter((column) => column !== VENDOR)).toEqual(selectedFields);
});

it.each([undefined, JSON.stringify([TOTAL_AMOUNT, DESCRIPTION])])('does not rewrite an unchanged expense preference (%s)', async (expenseFields) => {
    // Given an expense using either its initial selection or a saved selection.
    const props = renderFields(undefined, expenseFields);

    // When the user saves without editing any field.
    await props.onSave(props.currentColumns);

    // Then both preferences remain unchanged and the picker closes.
    expect(setNameValuePair).not.toHaveBeenCalled();
    expect(setReportDetailsColumns).not.toHaveBeenCalled();
    expect(Navigation.goBack).toHaveBeenCalledTimes(1);
});

it('saves the expense selection with its previous serialized value for rollback', async () => {
    // Given an explicit expense selection that differs from the table selection.
    const tableColumns = [RECEIPT, DATE, MERCHANT, TOTAL_AMOUNT];
    const expenseFields = JSON.stringify([TOTAL_AMOUNT, DESCRIPTION]);
    const props = renderFields(tableColumns, expenseFields);
    const selectedFields = [DESCRIPTION, TOTAL_AMOUNT, ATTENDEES];

    // When the user changes the expense selection and order.
    await props.onSave(selectedFields);

    // Then only the expense preference changes, with the previous JSON available for rollback.
    expect(props.currentColumns).toEqual([TOTAL_AMOUNT, DESCRIPTION]);
    expect(setNameValuePair).toHaveBeenCalledWith(ONYXKEYS.NVP_EXPENSE_FIELDS, JSON.stringify(selectedFields), expenseFields);
    expect(setReportDetailsColumns).not.toHaveBeenCalled();
});

it('keeps table aliases and header columns outside the expense preference', async () => {
    // Given table choices whose values already appear in expense editors or the header.
    const tableColumns = [RECEIPT, HELD, POSTED, TOTAL_PER_ATTENDEE, VENDOR, TOTAL_AMOUNT];
    const props = renderFields(tableColumns);
    const selectedFields = [TOTAL_AMOUNT, DESCRIPTION];

    // When the user hides other expense fields.
    await props.onSave(selectedFields);

    // Then the expense saves only its own fields without rewriting any table choice.
    expect(props.allColumns).not.toContain(RECEIPT);
    expect(props.allColumns).not.toContain(HELD);
    expect(props.allColumns).not.toContain(POSTED);
    expect(props.allColumns).not.toContain(TOTAL_PER_ATTENDEE);
    expect(setNameValuePair).toHaveBeenCalledWith(ONYXKEYS.NVP_EXPENSE_FIELDS, JSON.stringify([...selectedFields, VENDOR]), '');
    expect(setReportDetailsColumns).not.toHaveBeenCalled();
});

it('preserves an expense Vendor selection unavailable in the current workspace', async () => {
    // Given an account preference whose Vendor field is available in another workspace.
    const expenseFields = JSON.stringify([TOTAL_AMOUNT, VENDOR, DESCRIPTION]);
    const props = renderFields(undefined, expenseFields);

    // When the user adds an accounting field without being able to change Vendor here.
    await props.onSave([...props.currentColumns, CATEGORY_GL_CODE]);

    // Then the Vendor selection and position survive for the other workspace.
    expect(props.currentColumns).toEqual([TOTAL_AMOUNT, DESCRIPTION]);
    expect(props.allColumns).not.toContain(VENDOR);
    expect(setNameValuePair).toHaveBeenCalledWith(ONYXKEYS.NVP_EXPENSE_FIELDS, JSON.stringify([TOTAL_AMOUNT, VENDOR, DESCRIPTION, CATEGORY_GL_CODE]), expenseFields);
    expect(setReportDetailsColumns).not.toHaveBeenCalled();
});

it('includes explicitly configured report fields without losing the expense editors', () => {
    // Given a saved report table selection containing an additional accounting field.
    const tableColumns = [TOTAL_AMOUNT, CATEGORY_GL_CODE];

    // When the expense picker initializes before any separate expense customization.
    const props = renderFields(tableColumns);

    // Then both the report field and the normal expense editors are selected.
    expect(props.currentColumns).toEqual(getMoneyRequestViewFields(tableColumns).filter((column) => column !== VENDOR));
    expect(props.currentColumns).toContain(CATEGORY_GL_CODE);
    expect(props.currentColumns).toContain(DESCRIPTION);
    expect(props.currentColumns).toContain(ATTENDEES);
});

it('ignores data-driven table fields until they are explicitly selected', () => {
    // Given another expense whose MCC automatically adds a table column.
    mockReportTransactions = [{transactionID: 'transaction-1', reportID: 'report-1', amount: 1000, currency: 'USD', created: '2026-10-29', merchant: 'Market', mcc: '5411'}];

    // When an expense picker opens without a saved table or expense preference.
    const props = renderFields();

    // Then an automatic table column does not add a new expense row.
    expect(props.currentColumns).not.toContain(MCC);
    expect(props.currentColumns).toContain(DESCRIPTION);
});

it('falls back to the visible expense fields when stored JSON is invalid', async () => {
    // Given a malformed expense preference and an explicitly configured accounting field.
    const tableColumns = [TOTAL_AMOUNT, CATEGORY_GL_CODE];
    const props = renderFields(tableColumns, '{invalid');

    // When the user saves the fallback selection without changes.
    await props.onSave(props.currentColumns);

    // Then the picker still matches the expense and does not replace a preference merely by opening it.
    expect(props.currentColumns).toEqual(getMoneyRequestViewFields(tableColumns, '{invalid').filter((column) => column !== VENDOR));
    expect(setNameValuePair).not.toHaveBeenCalled();
    expect(setReportDetailsColumns).not.toHaveBeenCalled();
});

it('resets only the expense fields to their original editor order', async () => {
    // Given custom expense fields alongside a separate table selection.
    const tableColumns = [RECEIPT, TOTAL_AMOUNT, MCC];
    const expenseFields = JSON.stringify([MCC, TOTAL_AMOUNT]);
    const props = renderFields(tableColumns, expenseFields);
    const resetFields = props.defaultSelectedColumns.filter((column) => column !== VENDOR);

    // When the Reset selection is saved.
    await props.onSave(resetFields);

    // Then the expense restores its standard editors while the table remains unchanged.
    expect(resetFields).toEqual(getMoneyRequestViewFields().filter((column) => column !== VENDOR));
    expect(setNameValuePair).toHaveBeenCalledWith(ONYXKEYS.NVP_EXPENSE_FIELDS, JSON.stringify(resetFields), expenseFields);
    expect(setReportDetailsColumns).not.toHaveBeenCalled();
});

import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import MoneyRequestViewReportFields from '@components/MoneyRequestReportView/MoneyRequestViewReportFields';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';

import {updateReportField} from '@libs/actions/Report';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockShouldUseNarrowLayout = false;

jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({
        shouldUseNarrowLayout: mockShouldUseNarrowLayout,
        shouldUseNarrowLayoutIgnoringWideRHP: mockShouldUseNarrowLayout,
        isSmallScreenWidth: mockShouldUseNarrowLayout,
        isInNarrowPaneModal: false,
        isWideRHPDisplayedOnWideLayout: !mockShouldUseNarrowLayout,
        isSuperWideRHPDisplayedOnWideLayout: false,
    }),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
        toLocaleDigit: jest.fn((digit: string) => digit),
        localeCompare: jest.fn((first: string, second: string) => first.localeCompare(second)),
    })),
);

jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => jest.requireActual('@react-navigation/native'))(),
    useNavigation: jest.fn(() => ({navigate: jest.fn(), addListener: jest.fn(() => jest.fn())})),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: '', name: '', params: {reportID: '1'}})),
    // The option list is rendered outside a navigator here, so there is no focus cycle to refresh its snapshot on.
    useFocusEffect: jest.fn(),
}));

// The list field's dropdown is built on FilterPopupButton, which reads focus straight from @react-navigation/core.
jest.mock('@react-navigation/core', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/core'),
    useIsFocused: jest.fn(() => true),
}));

jest.mock('@libs/actions/Report', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Report'),
    updateReportField: jest.fn(),
}));

TestHelper.setupGlobalFetchMock();

const policyID = 'policy_report_fields_grid';
const reportID = 'report_report_fields_grid';
const accountID = 1;

const buildTextField = (index: number): OnyxTypes.PolicyReportField => ({
    name: `Field${index}`,
    fieldID: `field${index}`,
    defaultValue: '',
    value: `Value${index}`,
    orderWeight: index,
    type: CONST.REPORT_FIELD_TYPES.TEXT,
    deletable: true,
    values: [],
    keys: [],
    externalIDs: [],
    disabledOptions: [],
    target: CONST.REPORT_FIELD_TARGETS.EXPENSE,
    isTax: false,
});

// An empty value is what `getFieldViolation` turns into a "<name> is required" violation.
const buildEmptyField = (): OnyxTypes.PolicyReportField => ({
    ...buildTextField(1),
    name: 'EmptyField',
    fieldID: 'emptyField',
    value: '',
});

// A field that cannot be deleted is the one field that must always hold a value, so clearing it is rejected.
const buildRequiredField = (): OnyxTypes.PolicyReportField => ({
    ...buildTextField(1),
    name: 'RequiredField',
    fieldID: 'requiredField',
    deletable: false,
});

const buildListField = (): OnyxTypes.PolicyReportField => ({
    ...buildTextField(1),
    name: 'ListField',
    fieldID: 'listField',
    type: CONST.REPORT_FIELD_TYPES.LIST,
    value: 'Option1',
    values: ['Option1', 'Option2'],
    disabledOptions: [false, false],
});

const buildFieldList = (fieldCount: number): Record<string, OnyxTypes.PolicyReportField> => {
    const fieldList: Record<string, OnyxTypes.PolicyReportField> = {};
    for (let index = 1; index <= fieldCount; index++) {
        const field = buildTextField(index);
        fieldList[`expensify_${field.fieldID}`] = field;
    }
    return fieldList;
};

const buildPolicy = (fieldCount: number, extraFields: OnyxTypes.PolicyReportField[] = []): OnyxTypes.Policy => {
    const fieldList = buildFieldList(fieldCount);
    for (const field of extraFields) {
        fieldList[`expensify_${field.fieldID}`] = field;
    }

    return {
        ...LHNTestUtils.getFakePolicy(policyID, 'Policy'),
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        outputCurrency: CONST.CURRENCY.USD,
        areReportFieldsEnabled: true,
        fieldList,
    };
};

const buildReport = (): OnyxTypes.Report => ({
    ...LHNTestUtils.getFakeReport([accountID, 2]),
    reportID,
    type: CONST.REPORT.TYPE.EXPENSE,
    policyID,
    ownerAccountID: accountID,
    currency: CONST.CURRENCY.USD,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    total: 0,
});

const renderReportFields = async (fieldCount: number, extraFields: OnyxTypes.PolicyReportField[] = []) => {
    const policy = buildPolicy(fieldCount, extraFields);
    const report = buildReport();

    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
    });
    await waitForBatchedUpdatesWithAct();

    const rendered = render(
        <ComposeProviders components={[OnyxListItemProvider]}>
            <MoneyRequestViewReportFields
                report={report}
                policy={policy}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();

    return rendered;
};

describe('MoneyRequestViewReportFields', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        initOnyxDerivedValues();
        // Field violation copy comes from `translateLocal`, not the mocked `useLocalize`, so the locale has to be real.
        IntlStore.load('en');
        await waitForBatchedUpdatesWithAct();
    });

    beforeEach(async () => {
        mockShouldUseNarrowLayout = false;
        jest.clearAllMocks();
        await act(async () => {
            await TestHelper.signInWithTestUser(accountID);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('shows up to three fields per row on a wide layout', async () => {
        await renderReportFields(7);

        // 7 fields fill two rows of three and one row holding the remaining field
        expect(screen.getAllByTestId('reportFieldsRow')).toHaveLength(3);
    });

    it('shows one field per row on a narrow layout', async () => {
        mockShouldUseNarrowLayout = true;
        await renderReportFields(4);

        expect(screen.getAllByTestId('reportFieldsRow')).toHaveLength(4);
    });

    it('renders every field as an input holding its value', async () => {
        await renderReportFields(2);

        expect(screen.getByLabelText('Field1')).toHaveProp('value', 'Value1');
        expect(screen.getByLabelText('Field2')).toHaveProp('value', 'Value2');
    });

    it('saves a value typed into a field without leaving the report', async () => {
        await renderReportFields(2);

        const input = screen.getByLabelText('Field1');
        fireEvent.changeText(input, 'Updated value');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        expect(updateReportField).toHaveBeenCalledTimes(1);
        expect(jest.mocked(updateReportField).mock.calls.at(0)?.at(0)).toMatchObject({
            reportField: {fieldID: 'field1', value: 'Updated value'},
            previousReportField: {fieldID: 'field1', value: 'Value1'},
        });
    });

    it('saves the empty value when an optional field is cleared', async () => {
        await renderReportFields(2);

        const input = screen.getByLabelText('Field1');
        fireEvent.changeText(input, '');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        expect(updateReportField).toHaveBeenCalledTimes(1);
        expect(jest.mocked(updateReportField).mock.calls.at(0)?.at(0)).toMatchObject({
            reportField: {fieldID: 'field1', value: ''},
            previousReportField: {fieldID: 'field1', value: 'Value1'},
        });
    });

    it('rejects clearing a required field instead of saving it', async () => {
        await renderReportFields(1, [buildRequiredField()]);

        const input = screen.getByLabelText('RequiredField');
        fireEvent.changeText(input, '');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        expect(updateReportField).not.toHaveBeenCalled();
        expect(screen.getByText('common.error.fieldRequired')).toBeOnTheScreen();
    });

    it('does not save when the option a list field already holds is picked again', async () => {
        await renderReportFields(1, [buildListField()]);

        fireEvent.press(screen.getByLabelText('ListField'));
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('base-list-item-Option1'));
        await waitForBatchedUpdatesWithAct();

        expect(updateReportField).not.toHaveBeenCalled();
    });

    it('does not save when the value is left unchanged', async () => {
        await renderReportFields(2);

        const input = screen.getByLabelText('Field1');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        expect(updateReportField).not.toHaveBeenCalled();
    });

    it('keeps the fields of a row aligned at the top so an error grows the row downwards', async () => {
        await renderReportFields(3);

        expect(screen.getAllByTestId('reportFieldsRow').at(0)).toHaveStyle({alignItems: 'flex-start'});
    });

    it('holds back a field violation until the field has been left', async () => {
        await renderReportFields(1, [buildEmptyField()]);

        expect(screen.queryByText('EmptyField is required')).toBeNull();

        fireEvent(screen.getByLabelText('EmptyField'), 'blur');
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('EmptyField is required')).toBeOnTheScreen();
    });

    it('renders a list field as a collapsed combobox rather than a row that opens a page', async () => {
        await renderReportFields(1, [buildListField()]);

        const listInput = screen.getByLabelText('ListField');
        expect(listInput).toHaveProp('role', CONST.ROLE.COMBOBOX);
        expect(listInput).toHaveProp('accessibilityState', {expanded: false});
        expect(listInput).toHaveProp('value', 'Option1');

        // The dropdown content is deferred until the field is first opened, so no option row is mounted up front.
        expect(screen.queryByText('Option2')).toBeNull();
    });

    it('opens the option list in place when a list field is pressed', async () => {
        await renderReportFields(1, [buildListField()]);

        fireEvent.press(screen.getByLabelText('ListField'));
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByLabelText('ListField')).toHaveProp('accessibilityState', {expanded: true});
        expect(screen.getByText('Option2')).toBeOnTheScreen();
    });

    it('sizes the option popover like the Spend dropdowns instead of matching the field width', async () => {
        await renderReportFields(1, [buildListField()]);

        fireEvent.press(screen.getByLabelText('ListField'));
        await waitForBatchedUpdatesWithAct();

        // A popover as narrow as the field it is anchored to looked cramped, so it uses the width every Spend
        // filter dropdown uses.
        const popover = screen.UNSAFE_getByType(PopoverWithMeasuredContent);
        expect(popover.props.popoverDimensions).toEqual(expect.objectContaining({width: CONST.POPOVER_DROPDOWN_WIDTH}));
    });
});

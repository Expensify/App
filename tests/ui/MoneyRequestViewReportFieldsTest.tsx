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
import {StyleSheet} from 'react-native';
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

/** Every flattened style currently on screen, so a test can assert that some node does (or does not) carry one. */
const getRenderedStyles = (): unknown[] => {
    const renderedStyles: unknown[] = [];
    for (const node of screen.UNSAFE_root.findAll(() => true)) {
        renderedStyles.push(StyleSheet.flatten(node.props.style));
    }
    return renderedStyles;
};

// `getTextInputIconContainerStyles` gives every icon container a full-height centred box, and `pr0` then strips the
// right half of its padding. That one-sided padding identifies the caret container.
const caretContainer = {height: '100%', paddingHorizontal: 11, paddingRight: 0};

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

const renderReportFields = async (fieldCount: number, extraFields: OnyxTypes.PolicyReportField[] = [], shouldUseSingleColumn = false) => {
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
                shouldUseSingleColumn={shouldUseSingleColumn}
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
        // Given a report with 7 fields, a count that does not divide evenly into rows of three, because a partly
        // filled last row is the case that would regress if the chunking were off by one
        await renderReportFields(7);

        // When the fields are laid out on a wide layout
        // Then they occupy 3 rows, two full rows of three plus one holding the remaining field, which is what packing
        // the fields three to a row rather than stacking them produces
        expect(screen.getAllByTestId('reportFieldsRow')).toHaveLength(3);
    });

    it('shows one field per row on a narrow layout', async () => {
        // Given a narrow layout, where three fields side by side would each be too cramped to read
        mockShouldUseNarrowLayout = true;

        // When 4 fields are laid out
        await renderReportFields(4);

        // Then each one gets its own row, so the column count drops to 1 rather than staying at 3
        expect(screen.getAllByTestId('reportFieldsRow')).toHaveLength(4);
    });

    it('shows one field per row on a wide layout when a single column is requested', async () => {
        // Given a wide layout and a caller asking for a single column, which is how the one-expense report view
        // renders its fields inside a container too narrow for the grid
        // When 4 fields are laid out
        await renderReportFields(4, [], true);

        // Then each one gets its own row, proving `shouldUseSingleColumn` overrides the wide layout rather than only
        // taking effect when the layout is already narrow
        expect(screen.getAllByTestId('reportFieldsRow')).toHaveLength(4);
    });

    it('renders every field as an input holding its value', async () => {
        // Given a report with 2 fields that already hold values
        await renderReportFields(2);

        // When each field is looked up by its label
        // Then it is an input carrying the saved value, because the fields are edited in place now instead of being
        // rows that show the value and navigate to the editor page to change it
        expect(screen.getByLabelText('Field1')).toHaveProp('value', 'Value1');
        expect(screen.getByLabelText('Field2')).toHaveProp('value', 'Value2');
    });

    it('saves a value typed into a field without leaving the report', async () => {
        // Given a report with 2 fields
        await renderReportFields(2);

        // When a new value is typed into the first field and the field is left
        const input = screen.getByLabelText('Field1');
        fireEvent.changeText(input, 'Updated value');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        // Then the value is saved from the report itself, with the old value passed along so the optimistic update can
        // be rolled back. This is the whole point of inline editing: no navigation to the editor page to change a value
        expect(updateReportField).toHaveBeenCalledTimes(1);
        expect(jest.mocked(updateReportField).mock.calls.at(0)?.at(0)).toMatchObject({
            reportField: {fieldID: 'field1', value: 'Updated value'},
            previousReportField: {fieldID: 'field1', value: 'Value1'},
        });
    });

    it('saves the empty value when an optional field is cleared', async () => {
        // Given a report with 2 optional fields that already hold values
        await renderReportFields(2);

        // When the first field is emptied and left
        const input = screen.getByLabelText('Field1');
        fireEvent.changeText(input, '');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        // Then the empty value is saved, because deliberately clearing an optional field is a real edit and must not
        // be mistaken for the no-op case where the user tabbed through without changing anything
        expect(updateReportField).toHaveBeenCalledTimes(1);
        expect(jest.mocked(updateReportField).mock.calls.at(0)?.at(0)).toMatchObject({
            reportField: {fieldID: 'field1', value: ''},
            previousReportField: {fieldID: 'field1', value: 'Value1'},
        });
    });

    it('rejects clearing a required field instead of saving it', async () => {
        // Given a report holding a required field, which the editor page used to guard with its own form validation
        await renderReportFields(1, [buildRequiredField()]);

        // When the field is emptied and left
        const input = screen.getByLabelText('RequiredField');
        fireEvent.changeText(input, '');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        // Then nothing is saved and the error is shown instead, so moving the editing inline did not drop the
        // validation that the editor page used to apply before it would submit
        expect(updateReportField).not.toHaveBeenCalled();
        expect(screen.getByText('common.error.fieldRequired')).toBeOnTheScreen();
    });

    it('does not save when the option a list field already holds is picked again', async () => {
        // Given a list field already set to Option1
        await renderReportFields(1, [buildListField()]);

        // When the dropdown is opened and that same option is picked
        fireEvent.press(screen.getByLabelText('ListField'));
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('base-list-item-Option1'));
        await waitForBatchedUpdatesWithAct();

        // Then no update is sent, because a re-pick is not an edit and saving it would put a pointless entry in the
        // report history and mark the field as recently used for a value the user never actually changed
        expect(updateReportField).not.toHaveBeenCalled();
    });

    it('does not save when the value is left unchanged', async () => {
        // Given a report with 2 fields that already hold values
        await renderReportFields(2);

        // When a field is focused and left without typing, which happens constantly as the user tabs through a row
        const input = screen.getByLabelText('Field1');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        // Then nothing is saved, because blur is the save trigger now and merely passing through a field must not
        // cost a write
        expect(updateReportField).not.toHaveBeenCalled();
    });

    it('resets the displayed text when an edit is skipped because it only changed the whitespace', async () => {
        // Given a report with 2 fields that already hold values
        await renderReportFields(2);

        // When the value is retyped with surrounding whitespace and the field is left
        const input = screen.getByLabelText('Field1');
        fireEvent.changeText(input, '  Value1  ');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        // Then no update is sent, because the value is unchanged once trimmed
        expect(updateReportField).not.toHaveBeenCalled();

        // Then the field shows the saved value again rather than the whitespace the user typed. The saved value never
        // changed, so nothing else would ever correct the display and the text would silently snap back on remount
        expect(screen.getByLabelText('Field1')).toHaveProp('value', 'Value1');
    });

    it('keeps the fields of a row aligned at the top so an error grows the row downwards', async () => {
        // Given a full row of 3 fields
        await renderReportFields(3);

        // When the row is laid out
        // Then its fields are aligned to the top, so one field growing taller to show a validation error pushes its
        // own content down instead of re-centering the two fields beside it
        expect(screen.getAllByTestId('reportFieldsRow').at(0)).toHaveStyle({alignItems: 'flex-start'});
    });

    it('holds back a field violation until the field has been left', async () => {
        // Given a required field that is already empty when the report opens, so its violation is true from the start
        await renderReportFields(1, [buildEmptyField()]);

        // Then the error is not shown yet, because a report full of empty required fields would otherwise open as a
        // wall of red before the user has touched anything
        expect(screen.queryByText('EmptyField is required')).toBeNull();

        // When the user focuses the field and leaves it without filling it in
        fireEvent(screen.getByLabelText('EmptyField'), 'blur');
        await waitForBatchedUpdatesWithAct();

        // Then the error appears, because by now the user has had their chance to fill it in
        expect(screen.getByText('EmptyField is required')).toBeOnTheScreen();
    });

    it('renders a list field as a collapsed combobox rather than a row that opens a page', async () => {
        // Given a report holding a list field set to Option1
        await renderReportFields(1, [buildListField()]);

        // When the field is inspected before it has been opened
        const listInput = screen.getByLabelText('ListField');

        // Then it exposes itself to assistive tech as a closed combobox showing the current value, which is what a
        // dropdown that opens in place must look like, unlike the old row that announced itself as a link to a page
        expect(listInput).toHaveProp('role', CONST.ROLE.COMBOBOX);
        expect(listInput).toHaveProp('accessibilityState', {expanded: false});
        expect(listInput).toHaveProp('value', 'Option1');

        // Then no option row is mounted yet, because building the option list for every list field on a report full of
        // them would be paid for up front even though most dropdowns are never opened
        expect(screen.queryByText('Option2')).toBeNull();
    });

    it('hides the text cursor on a list field but keeps it on a text field', async () => {
        // Given a report holding both a text field and a list field
        await renderReportFields(1, [buildListField()]);

        // When the two inputs are compared
        // Then the list field hides the cursor, because its value is picked from the dropdown rather than typed, and
        // `disableKeyboard` alone only suppresses the software keyboard and would still leave a cursor blinking in a
        // field the user cannot type into.
        expect(screen.getByLabelText('ListField')).toHaveProp('caretHidden', true);

        // Then the text field is untouched and still shows its cursor.
        expect(screen.getByLabelText('Field1')).not.toHaveProp('caretHidden', true);
    });

    it('opens the option list in place when a list field is pressed', async () => {
        // Given a report holding a list field
        await renderReportFields(1, [buildListField()]);

        // When the field is pressed
        fireEvent.press(screen.getByLabelText('ListField'));
        await waitForBatchedUpdatesWithAct();

        // Then the options appear over the report and the combobox reports itself as expanded, which is what
        // replacing the navigation to the editor page with an in-place dropdown has to produce
        expect(screen.getByLabelText('ListField')).toHaveProp('accessibilityState', {expanded: true});
        expect(screen.getByText('Option2')).toBeOnTheScreen();
    });

    it('keeps the caret in the same place when the option list opens', async () => {
        // Given a closed list field whose caret sits in a container padded on one side only
        await renderReportFields(1, [buildListField()]);

        expect(getRenderedStyles()).toEqual(expect.arrayContaining([expect.objectContaining(caretContainer)]));

        // When the list is opened and the caret flips to point up
        fireEvent.press(screen.getByLabelText('ListField'));
        await waitForBatchedUpdatesWithAct();

        // Then the caret is mirrored on the vertical axis rather than rotated. `rotate(180deg)` would carry the
        // asymmetric padding around with it and slide the caret 11px left the instant the list opens, so the caret
        // would visibly jump sideways every time the user opened a dropdown
        const expandedStyles = getRenderedStyles();
        expect(expandedStyles).toEqual(expect.arrayContaining([expect.objectContaining({...caretContainer, transform: [{scaleY: -1}]})]));
        expect(expandedStyles).not.toEqual(expect.arrayContaining([expect.objectContaining({transform: [{rotate: '180deg'}]})]));
    });

    it('sizes the option popover like the Spend dropdowns instead of matching the field width', async () => {
        // Given a report holding a list field, which in the grid can be as narrow as a third of a row
        await renderReportFields(1, [buildListField()]);

        // When its option list is opened
        fireEvent.press(screen.getByLabelText('ListField'));
        await waitForBatchedUpdatesWithAct();

        // Then the popover takes the standard dropdown width rather than the width of the field it is anchored to,
        // because a popover that narrow left the option labels cramped and truncated
        const popover = screen.UNSAFE_getByType(PopoverWithMeasuredContent);
        expect(popover.props.popoverDimensions).toEqual(expect.objectContaining({width: CONST.POPOVER_DROPDOWN_WIDTH}));
    });
});

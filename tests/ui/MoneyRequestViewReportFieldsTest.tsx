import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import MoneyRequestViewReportFields from '@components/MoneyRequestReportView/MoneyRequestViewReportFields';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {updateReportField} from '@libs/actions/Report';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockShouldUseNarrowLayout = false;

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({
        shouldUseNarrowLayout: mockShouldUseNarrowLayout,
        isSmallScreenWidth: mockShouldUseNarrowLayout,
        isInNarrowPaneModal: false,
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
});

const buildFieldList = (fieldCount: number): Record<string, OnyxTypes.PolicyReportField> => {
    const fieldList: Record<string, OnyxTypes.PolicyReportField> = {};
    for (let index = 1; index <= fieldCount; index++) {
        const field = buildTextField(index);
        fieldList[`expensify_${field.fieldID}`] = field;
    }
    return fieldList;
};

const buildPolicy = (fieldCount: number): OnyxTypes.Policy => ({
    ...LHNTestUtils.getFakePolicy(policyID, 'Policy'),
    type: CONST.POLICY.TYPE.TEAM,
    role: CONST.POLICY.ROLE.ADMIN,
    outputCurrency: CONST.CURRENCY.USD,
    areReportFieldsEnabled: true,
    fieldList: buildFieldList(fieldCount),
});

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

const renderReportFields = async (fieldCount: number) => {
    const policy = buildPolicy(fieldCount);
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
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        initOnyxDerivedValues();
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

    it('does not save when the value is left unchanged', async () => {
        await renderReportFields(2);

        const input = screen.getByLabelText('Field1');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        expect(updateReportField).not.toHaveBeenCalled();
    });
});

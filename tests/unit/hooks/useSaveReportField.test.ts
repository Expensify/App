import {renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useSaveReportField from '@hooks/useSaveReportField';

import {updateReportField} from '@libs/actions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyReportField, Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/Report', () => ({
    __esModule: true,
    updateReportField: jest.fn(),
    updateReportName: jest.fn(),
}));

const mockUpdateReportField = jest.mocked(updateReportField);

const FIELD_ID = 'field_id_LOCATION';
const FIELD_KEY = `expensify_${FIELD_ID}`;

function buildLocationField(overrides: Partial<PolicyReportField>): PolicyReportField {
    return {
        fieldID: FIELD_ID,
        name: 'Location',
        type: CONST.REPORT_FIELD_TYPES.LIST,
        defaultValue: '',
        orderWeight: 1,
        deletable: false,
        target: CONST.REPORT_FIELD_TARGETS.EXPENSE,
        values: [],
        keys: [],
        externalIDs: [],
        disabledOptions: [],
        isTax: false,
        ...overrides,
    };
}

// The report's copy was saved before the workspace gained the "Admin" option, so its options sit one position earlier
const reportCopyField = buildLocationField({
    value: 'Advisory / Consulting',
    externalID: '21',
    values: ['Corporate / Marketing', 'SW Sales / Marketing', 'Advisory / Consulting'],
    keys: ['46', '336', '21'],
    externalIDs: ['46', '336', '21'],
    disabledOptions: [false, false, false],
});

const policyField = buildLocationField({
    values: ['Admin', 'Corporate / Marketing', 'SW Sales / Marketing', 'Advisory / Consulting'],
    keys: ['7', '46', '336', '21'],
    externalIDs: ['7', '46', '336', '21'],
    disabledOptions: [false, false, false, false],
});

function buildReport(): Report {
    return {
        ...createRandomReport(1, undefined),
        type: CONST.REPORT.TYPE.EXPENSE,
        stateNum: CONST.REPORT.STATE_NUM.APPROVED,
        statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        fieldList: {[FIELD_KEY]: reportCopyField},
    };
}

function buildPolicy(fieldList: Record<string, PolicyReportField>): Policy {
    return {...createRandomPolicy(1), areReportFieldsEnabled: true, fieldList};
}

function getSavedReportField(): PolicyReportField | undefined {
    return mockUpdateReportField.mock.calls.at(0)?.at(0)?.reportField;
}

describe('useSaveReportField', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockUpdateReportField.mockClear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('saves the external ID of the picked option from the workspace field', () => {
        // Given the field passed in by the inline inputs, which holds the workspace's option names with the report's older external IDs
        const report = buildReport();
        const passedField: PolicyReportField = {...reportCopyField, values: policyField.values, disabledOptions: policyField.disabledOptions};
        const {result} = renderHook(() => useSaveReportField(report, buildPolicy({[FIELD_KEY]: policyField})), {wrapper: OnyxListItemProvider});

        // When the user picks "SW Sales / Marketing"
        result.current(passedField, 'SW Sales / Marketing');

        // Then the workspace ID of that option is saved, not the ID found at the same position in the report's older list
        expect(getSavedReportField()).toMatchObject({value: 'SW Sales / Marketing', externalID: '336'});
    });

    it("uses the report's copy of the options once the workspace no longer has the field", () => {
        // Given a workspace that dropped the field, so only the report's copy knows the options
        const report = buildReport();
        const {result} = renderHook(() => useSaveReportField(report, buildPolicy({})), {wrapper: OnyxListItemProvider});

        // When the user picks "Corporate / Marketing"
        result.current(reportCopyField, 'Corporate / Marketing');

        // Then the ID comes from the report's copy, which lists that option with its own ID
        expect(getSavedReportField()).toMatchObject({value: 'Corporate / Marketing', externalID: '46'});
    });

    it('leaves the external ID of a text field unchanged', () => {
        // Given a text field, which has no options to look an external ID up in
        const report = buildReport();
        const textField = buildLocationField({type: CONST.REPORT_FIELD_TYPES.TEXT, externalID: 'text-id'});
        const {result} = renderHook(() => useSaveReportField(report, buildPolicy({[FIELD_KEY]: textField})), {wrapper: OnyxListItemProvider});

        // When the user saves a new value
        result.current(textField, 'New text');

        // Then only the value changes
        expect(getSavedReportField()).toMatchObject({value: 'New text', externalID: 'text-id'});
    });
});

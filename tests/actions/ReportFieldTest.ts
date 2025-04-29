import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import {generateFieldID} from '@libs/WorkspaceReportFieldUtils';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Policy from '@src/libs/actions/Policy/Policy';
import * as ReportField from '@src/libs/actions/Policy/ReportField';
import type {CreateReportFieldArguments} from '@src/libs/actions/Policy/ReportField';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import type {PolicyReportField, Policy as PolicyType} from '@src/types/onyx';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';
import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import type {MockFetch} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type PolicyReportFieldWithOfflineFeedback = Record<string, OnyxValueWithOfflineFeedback<PolicyReportField>>;
type PolicyReportFieldWithoutOfflineFeedback = Record<string, PolicyReportField>;

OnyxUpdateManager();
describe('actions/ReportField', () => {
    function connectToFetchPolicy(policyID: string): Promise<OnyxEntry<PolicyType>> {
        return new Promise((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                callback: (workspace) => {
                    Onyx.disconnect(connection);
                    resolve(workspace);
                },
            });
        });
    }

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    let mockFetch: MockFetch;
    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('createReportField', () => {
        it('creates a new text report field of a workspace', async () => {
            mockFetch.pause();
            Onyx.set(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            const reportFieldName = 'Test Field';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const newReportField: OnyxValueWithOfflineFeedback<PolicyReportField> = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.TEXT,
                defaultValue: 'Default Value',
                values: [],
                disabledOptions: [],
                fieldID: reportFieldID,
                orderWeight: 1,
                deletable: false,
                keys: [],
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                externalIDs: [],
                isTax: false,
            };
            const createReportFieldArguments: CreateReportFieldArguments = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.TEXT,
                initialValue: 'Default Value',
            };

            ReportField.createReportField(policyID, createReportFieldArguments);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(policyID);

            // check if the new report field was added to the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: {...newReportField, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            });

            // Check for success data
            mockFetch.resume();
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(policyID);

            // Check if the policy pending action was cleared
            expect(policy?.fieldList?.[reportFieldKey]?.pendingAction).toBeFalsy();
        });

        it('creates a new date report field of a workspace', async () => {
            mockFetch.pause();
            Onyx.set(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            const reportFieldName = 'Test Field 2';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const defaultDate = DateUtils.extractDate(new Date().toString());
            const newReportField: OnyxValueWithOfflineFeedback<PolicyReportField> = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.DATE,
                defaultValue: defaultDate,
                values: [],
                disabledOptions: [],
                fieldID: reportFieldID,
                orderWeight: 1,
                deletable: false,
                keys: [],
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                externalIDs: [],
                isTax: false,
            };
            const createReportFieldArguments: CreateReportFieldArguments = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.DATE,
                initialValue: defaultDate,
            };

            ReportField.createReportField(policyID, createReportFieldArguments);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(policyID);

            // check if the new report field was added to the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: {...newReportField, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            });

            // Check for success data
            mockFetch.resume();
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(policyID);

            // Check if the policy pending action was cleared
            expect(policy?.fieldList?.[reportFieldKey]?.pendingAction).toBeFalsy();
        });

        it('creates a new list report field of a workspace', async () => {
            mockFetch.pause();
            Onyx.set(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
                [INPUT_IDS.LIST_VALUES]: ['Value 1', 'Value 2'],
                [INPUT_IDS.DISABLED_LIST_VALUES]: [false, true],
            });
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            const reportFieldName = 'Test Field 3';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const newReportField: OnyxValueWithOfflineFeedback<PolicyReportField> = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.LIST,
                defaultValue: '',
                values: ['Value 1', 'Value 2'],
                disabledOptions: [false, true],
                fieldID: reportFieldID,
                orderWeight: 1,
                deletable: false,
                keys: [],
                externalIDs: [],
                isTax: false,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            };
            const createReportFieldArguments: CreateReportFieldArguments = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.LIST,
                initialValue: '',
            };

            ReportField.createReportField(policyID, createReportFieldArguments);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(policyID);

            // check if the new report field was added to the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: {...newReportField, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            });

            // Check for success data
            mockFetch.resume();
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(policyID);

            // Check if the policy pending action was cleared
            expect(policy?.fieldList?.[reportFieldKey].pendingAction).toBeFalsy();
        });
    });

    describe('deleteReportField', () => {
        it('Deleted a report field from a workspace', async () => {
            const fakePolicy = createRandomPolicy(0);
            const reportFieldName = 'Test Field';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const fakeReportField: OnyxValueWithOfflineFeedback<PolicyReportField> = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.TEXT,
                defaultValue: 'Default Value',
                values: [],
                disabledOptions: [],
                fieldID: reportFieldID,
                orderWeight: 1,
                deletable: false,
                keys: [],
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                value: 'default',
                externalIDs: [],
                isTax: false,
            };
            fakePolicy.fieldList = {
                [reportFieldKey]: fakeReportField,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(fakePolicy.id);

            // check if the report field exists in the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: fakeReportField,
            });

            ReportField.deleteReportFields(fakePolicy.id, [reportFieldKey]);
            await waitForBatchedUpdates();

            // Check for success data
            mockFetch.resume();
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(fakePolicy.id);

            // Check if the policy report field was removed
            expect(policy?.fieldList?.[reportFieldKey]).toBeFalsy();
        });

        it('Deleted a report field from a workspace when API fails', async () => {
            const policyID = Policy.generatePolicyID();
            const fakePolicy = createRandomPolicy(Number(policyID));
            const reportFieldName = 'Test Field';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const fakeReportField: OnyxValueWithOfflineFeedback<PolicyReportField> = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.TEXT,
                defaultValue: 'Default Value',
                values: [],
                disabledOptions: [],
                fieldID: reportFieldID,
                orderWeight: 1,
                deletable: false,
                keys: [],
                value: 'default',
                externalIDs: [],
                isTax: false,
            };
            fakePolicy.fieldList = {
                [reportFieldKey]: fakeReportField,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(policyID);

            // check if the report field exists in the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: fakeReportField,
            });

            // Check for failure data
            mockFetch.fail();
            ReportField.deleteReportFields(policyID, [reportFieldKey]);
            await waitForBatchedUpdates();

            mockFetch.resume();
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(policyID);

            // check if the deleted report field was reset in the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: fakeReportField,
            });
        });
    });

    describe('updateReportFieldInitialValue', () => {
        it('updates the initial value of a text report field', async () => {
            mockFetch.pause();

            const policyID = Policy.generatePolicyID();
            const reportFieldName = 'Test Field';
            const oldInitialValue = 'Old initial value';
            const newInitialValue = 'New initial value';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const reportField: PolicyReportField = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.TEXT,
                defaultValue: oldInitialValue,
                values: [],
                disabledOptions: [],
                fieldID: reportFieldID,
                orderWeight: 1,
                deletable: false,
                keys: [],
                externalIDs: [],
                isTax: false,
            };
            const fakePolicy = createRandomPolicy(Number(policyID));

            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {...fakePolicy, fieldList: {[reportFieldKey]: reportField}});
            await waitForBatchedUpdates();

            ReportField.updateReportFieldInitialValue(policyID, reportFieldID, newInitialValue);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(policyID);

            // check if the updated report field was set to the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: {
                    ...reportField,
                    defaultValue: newInitialValue,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            });

            // Check for success data
            mockFetch.resume();
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(policyID);

            // Check if the policy pending action was cleared
            expect(policy?.fieldList?.[reportFieldKey].pendingAction).toBeFalsy();
        });

        it('updates the initial value of a text report field when api returns an error', async () => {
            mockFetch.pause();

            const policyID = Policy.generatePolicyID();
            const reportFieldName = 'Test Field';
            const oldInitialValue = 'Old initial value';
            const newInitialValue = 'New initial value';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const reportField: PolicyReportField = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.TEXT,
                defaultValue: oldInitialValue,
                values: [],
                disabledOptions: [],
                fieldID: reportFieldID,
                orderWeight: 1,
                deletable: false,
                keys: [],
                externalIDs: [],
                isTax: false,
            };
            const fakePolicy = createRandomPolicy(Number(policyID));

            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {...fakePolicy, fieldList: {[reportFieldKey]: reportField}});
            await waitForBatchedUpdates();

            ReportField.updateReportFieldInitialValue(policyID, reportFieldID, newInitialValue);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(policyID);

            // check if the updated report field was set to the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: {
                    ...reportField,
                    defaultValue: newInitialValue,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            });

            // Check for failure data
            mockFetch.fail();
            mockFetch.resume();
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(policyID);

            // check if the updated report field was reset in the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: reportField,
            });
            // Check if the policy errors was set
            expect(policy?.errorFields?.[reportFieldKey]).toBeTruthy();
        });
    });

    describe('updateReportFieldListValueEnabled', () => {
        it('updates the enabled flag of report field list values', async () => {
            mockFetch.pause();

            const policyID = Policy.generatePolicyID();
            const reportFieldName = 'Test Field';
            const valueIndexesTpUpdate = [1, 2];
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const reportField: PolicyReportField = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.LIST,
                defaultValue: 'Value 2',
                values: ['Value 1', 'Value 2', 'Value 3'],
                disabledOptions: [false, false, true],
                fieldID: reportFieldID,
                orderWeight: 1,
                deletable: false,
                keys: [],
                externalIDs: [],
                isTax: false,
                value: CONST.REPORT_FIELD_TYPES.LIST,
            };
            const fakePolicy = createRandomPolicy(Number(policyID));

            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {...fakePolicy, fieldList: {[reportFieldKey]: reportField}});
            await waitForBatchedUpdates();

            ReportField.updateReportFieldListValueEnabled(policyID, reportFieldID, valueIndexesTpUpdate, false);
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(policyID);

            // check if the new report field was added to the policy optimistically
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithoutOfflineFeedback>({
                [reportFieldKey]: {
                    ...reportField,
                    defaultValue: '',
                    disabledOptions: [false, true, true],
                },
            });
        });
    });

    describe('addReportFieldListValue', () => {
        it('adds a new value to a report field list', async () => {
            mockFetch.pause();

            const policyID = Policy.generatePolicyID();
            const reportFieldName = 'Test Field';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const reportField: PolicyReportField = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.LIST,
                defaultValue: 'Value 2',
                values: ['Value 1', 'Value 2', 'Value 3'],
                disabledOptions: [false, false, true],
                fieldID: reportFieldID,
                orderWeight: 1,
                deletable: false,
                keys: [],
                externalIDs: [],
                isTax: false,
                value: CONST.REPORT_FIELD_TYPES.LIST,
            };
            const fakePolicy = createRandomPolicy(Number(policyID));
            const newListValueName = 'Value 4';

            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {...fakePolicy, fieldList: {[reportFieldKey]: reportField}});
            await waitForBatchedUpdates();

            ReportField.addReportFieldListValue(policyID, reportFieldID, newListValueName);
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(policyID);
            // Check if the new report field was added to the policy optimistically
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithoutOfflineFeedback>({
                [reportFieldKey]: {
                    ...reportField,
                    values: [...reportField.values, newListValueName],
                    disabledOptions: [...reportField.disabledOptions, false],
                },
            });
        });
    });

    describe('removeReportFieldListValue', () => {
        it('removes list values from a report field list', async () => {
            mockFetch.pause();

            const policyID = Policy.generatePolicyID();
            const reportFieldName = 'Test Field';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const reportField: PolicyReportField = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.LIST,
                defaultValue: 'Value 2',
                values: ['Value 1', 'Value 2', 'Value 3'],
                disabledOptions: [false, false, true],
                fieldID: reportFieldID,
                orderWeight: 1,
                deletable: false,
                keys: [],
                externalIDs: [],
                isTax: false,
                value: CONST.REPORT_FIELD_TYPES.LIST,
            };
            const fakePolicy = createRandomPolicy(Number(policyID));

            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {...fakePolicy, fieldList: {[reportFieldKey]: reportField}});
            await waitForBatchedUpdates();

            ReportField.removeReportFieldListValue(policyID, reportFieldID, [1, 2]);
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(policyID);

            // Check if the values were removed from the report field optimistically
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithoutOfflineFeedback>({
                [reportFieldKey]: {
                    ...reportField,
                    defaultValue: '',
                    values: ['Value 1'],
                    disabledOptions: [false],
                },
            });
        });
    });
});

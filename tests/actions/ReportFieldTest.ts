import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {generateFieldID} from '@libs/WorkspaceReportFieldUtils';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Policy from '@src/libs/actions/Policy/Policy';
import * as ReportField from '@src/libs/actions/Policy/ReportField';
import type {CreateReportFieldParams} from '@src/libs/actions/Policy/ReportField';
import HttpUtils from '@src/libs/HttpUtils';
import * as NetworkStore from '@src/libs/Network/NetworkStore';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import type {PolicyReportField, Policy as PolicyType} from '@src/types/onyx';
import type {ErrorFields, OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
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
        mockFetch = TestHelper.getGlobalFetchMock();
        global.fetch = mockFetch;

        // Ensure clean queues and no pending requests between tests
        SequentialQueue.resetQueue();
        HttpUtils.cancelPendingRequests();
        NetworkStore.checkRequiredData();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('createReportField', () => {
        afterEach(() => {
            // Make sure paused fetches don’t leak between tests
            mockFetch?.resume?.();
        });
        it('creates a new text report field of a workspace', async () => {
            mockFetch.pause();
            Onyx.set(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {});
            await waitForBatchedUpdates();

            const fakePolicy = createRandomPolicy(0);
            const reportFieldName = 'Test Field';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const newReportField: OnyxValueWithOfflineFeedback<PolicyReportField> = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.TEXT,
                target: 'expense',
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
            const createReportFieldArguments: CreateReportFieldParams = {
                policy: fakePolicy,
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.TEXT,
                initialValue: 'Default Value',
                listValues: [],
                disabledListValues: [],
                policyReportIDs: [],
            };

            ReportField.createReportField(createReportFieldArguments);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(fakePolicy.id);

            // check if the new report field was added to the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: {...newReportField, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            });

            // Check for success data
            mockFetch.resume();
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(fakePolicy.id);

            // Check if the policy pending action was cleared
            expect(policy?.fieldList?.[reportFieldKey]?.pendingAction).toBeFalsy();
        });

        it('creates a new date report field of a workspace', async () => {
            mockFetch.pause();
            Onyx.set(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {});
            await waitForBatchedUpdates();

            const fakePolicy = createRandomPolicy(0);
            const reportFieldName = 'Test Field 2';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const defaultDate = DateUtils.extractDate(new Date().toString());
            const newReportField: OnyxValueWithOfflineFeedback<PolicyReportField> = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.DATE,
                target: 'expense',
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
            const createReportFieldArguments: CreateReportFieldParams = {
                policy: fakePolicy,
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.DATE,
                initialValue: defaultDate,
                listValues: [],
                disabledListValues: [],
                policyReportIDs: [],
            };

            ReportField.createReportField(createReportFieldArguments);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(fakePolicy.id);

            // check if the new report field was added to the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: {...newReportField, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            });

            // Check for success data
            mockFetch.resume();
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(fakePolicy.id);

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

            const fakePolicy = createRandomPolicy(0);
            const reportFieldName = 'Test Field 3';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const newReportField: OnyxValueWithOfflineFeedback<PolicyReportField> = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.LIST,
                target: 'expense',
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
            const createReportFieldArguments: CreateReportFieldParams = {
                policy: fakePolicy,
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.LIST,
                initialValue: '',
                listValues: ['Value 1', 'Value 2'],
                disabledListValues: [false, true],
                policyReportIDs: [],
            };

            ReportField.createReportField(createReportFieldArguments);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(fakePolicy.id);

            // check if the new report field was added to the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: {...newReportField, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            });

            // Check for success data
            mockFetch.resume();
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(fakePolicy.id);

            // Check if the policy pending action was cleared
            expect(policy?.fieldList?.[reportFieldKey].pendingAction).toBeFalsy();
        });

        it('keeps the failed report field with an error until the error is dismissed', async () => {
            // Given a workspace with a report title error
            const reportFieldName = 'Test Field';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const titleErrors = {[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: 'Title error'};
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0),
                fieldList: {},
                errorFields: {fieldList: titleErrors},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When creating a report field fails on the server
            mockFetch.pause();
            ReportField.createReportField({
                policy: fakePolicy,
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.TEXT,
                initialValue: '{field:DoesNotExist}',
                listValues: [],
                disabledListValues: [],
                policyReportIDs: [],
            });
            await waitForBatchedUpdates();
            mockFetch.fail();
            mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the field stays in the list with its error so the user can see which field failed, and the title error is kept
            let policy = await connectToFetchPolicy(fakePolicy.id);
            expect(policy?.fieldList?.[reportFieldKey]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(policy?.errorFields?.fieldList?.[reportFieldKey]).toBeTruthy();
            expect(policy?.errorFields?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]).toBe(titleErrors[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]);

            // When the user dismisses the error
            ReportField.clearReportFieldErrors(policy, reportFieldID);
            await waitForBatchedUpdates();

            // Then the failed field and its errors are removed, and the title error is untouched
            policy = await connectToFetchPolicy(fakePolicy.id);
            expect(policy?.fieldList?.[reportFieldKey]).toBeUndefined();
            expect(policy?.errorFields?.fieldList).toEqual(titleErrors);
        });
    });

    describe('clearReportFieldErrors', () => {
        it('clears the errors of an existing report field without removing it', async () => {
            // Given an existing report field whose initial value update was rejected by the server
            const reportFieldName = 'Test Field';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            const reportField: PolicyReportField = {
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.TEXT,
                defaultValue: 'Default Value',
                values: [],
                disabledOptions: [],
                fieldID: reportFieldID,
                orderWeight: 1,
                deletable: false,
                keys: [],
                externalIDs: [],
                isTax: false,
            };
            const errorKey = DateUtils.getMicroseconds();
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0),
                fieldList: {[reportFieldKey]: reportField},
                // The server returns report field errors at errorFields.fieldList.<fieldKey>.defaultValue, which ErrorFields doesn't model
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                errorFields: {
                    fieldList: {[reportFieldKey]: {defaultValue: {[errorKey]: 'Formula field {field:DoesNotExist} not recognized'}}},
                } as unknown as ErrorFields,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When the user dismisses the error
            ReportField.clearReportFieldErrors(fakePolicy, reportFieldID);
            await waitForBatchedUpdates();

            // Then the error is cleared and the field is kept, because it already exists on the server
            const policy = await connectToFetchPolicy(fakePolicy.id);
            expect(policy?.fieldList?.[reportFieldKey]).toEqual(reportField);
            expect(policy?.errorFields?.fieldList?.[reportFieldKey]).toBeUndefined();
        });
    });

    it('optimistically treats Text type with formula-like initial value as Formula', async () => {
        mockFetch.pause();
        Onyx.set(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {});
        await waitForBatchedUpdates();

        const fakePolicy = createRandomPolicy(0);
        const reportFieldName = 'Formula-ish Text Field';
        const reportFieldID = generateFieldID(reportFieldName);
        const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
        const formulaInitialValue = '{report:id}';
        const expectedReportField: OnyxValueWithOfflineFeedback<PolicyReportField> = {
            name: reportFieldName,
            type: CONST.REPORT_FIELD_TYPES.FORMULA,
            target: 'expense',
            defaultValue: formulaInitialValue,
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
        const createReportFieldArguments: CreateReportFieldParams = {
            policy: fakePolicy,
            name: reportFieldName,
            type: CONST.REPORT_FIELD_TYPES.TEXT,
            initialValue: formulaInitialValue,
            listValues: [],
            disabledListValues: [],
            policyReportIDs: [],
        };

        ReportField.createReportField(createReportFieldArguments);
        await waitForBatchedUpdates();

        const policy = await connectToFetchPolicy(fakePolicy.id);

        expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
            [reportFieldKey]: {...expectedReportField, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
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

            ReportField.deleteReportFields({policy, reportFieldsToUpdate: [reportFieldKey]});
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
            ReportField.deleteReportFields({policy, reportFieldsToUpdate: [reportFieldKey]});
            await waitForBatchedUpdates();

            mockFetch.resume();
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(policyID);

            // check if the deleted report field was reset in the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: fakeReportField,
            });
        });

        it('leaves a report field that failed to be created out of the request and keeps its error', async () => {
            // Given a workspace with a field to delete and a field that failed to be created, which is still pending ADD with its error
            const reportFieldToDelete: PolicyReportField = {
                name: 'Field To Delete',
                type: CONST.REPORT_FIELD_TYPES.TEXT,
                defaultValue: 'Default Value',
                values: [],
                disabledOptions: [],
                fieldID: generateFieldID('Field To Delete'),
                orderWeight: 1,
                deletable: true,
                keys: [],
                externalIDs: [],
                isTax: false,
            };
            const failedReportField: OnyxValueWithOfflineFeedback<PolicyReportField> = {
                ...reportFieldToDelete,
                name: 'Failed Field',
                defaultValue: '{field:DoesNotExist}',
                fieldID: generateFieldID('Failed Field'),
                orderWeight: 2,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            };
            const reportFieldToDeleteKey = ReportUtils.getReportFieldKey(reportFieldToDelete.fieldID);
            const failedReportFieldKey = ReportUtils.getReportFieldKey(failedReportField.fieldID);
            const failedReportFieldErrors = {defaultValue: {[DateUtils.getMicroseconds()]: 'Formula field {field:DoesNotExist} not recognized'}};
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0),
                fieldList: {
                    [reportFieldToDeleteKey]: reportFieldToDelete,
                    [failedReportFieldKey]: failedReportField,
                },
                // The server returns report field errors at errorFields.fieldList.<fieldKey>.defaultValue, which ErrorFields doesn't model
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                errorFields: {fieldList: {[failedReportFieldKey]: failedReportFieldErrors}} as unknown as ErrorFields,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When the user deletes the other field before dismissing the error
            ReportField.deleteReportFields({policy: fakePolicy, reportFieldsToUpdate: [reportFieldToDeleteKey]});
            await waitForBatchedUpdates();

            // Then the failed field isn't sent to the server as a remaining field, because it was never created there
            const body = TestHelper.getFetchMockCalls(WRITE_COMMANDS.DELETE_POLICY_REPORT_FIELD).at(0)?.[1]?.body;
            const reportFields = body instanceof FormData ? body.get('reportFields') : null;
            expect(reportFields).toBe(JSON.stringify([]));

            // Then the failed field keeps its error, so it's still treated as failed until the error is dismissed
            const policy = await connectToFetchPolicy(fakePolicy.id);
            expect(policy?.fieldList?.[reportFieldToDeleteKey]).toBeUndefined();
            expect(policy?.fieldList?.[failedReportFieldKey]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(policy?.errorFields?.fieldList?.[failedReportFieldKey]).toEqual(failedReportFieldErrors);
            expect(ReportUtils.isFailedReportFieldAdd(policy?.fieldList?.[failedReportFieldKey], policy?.errorFields)).toBe(true);
        });
    });

    describe('updateReportFieldInitialValue', () => {
        it('updates the initial value of a text report field', async () => {
            mockFetch.pause();

            const fakePolicy = createRandomPolicy(0);
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

            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy?.id}`, {...fakePolicy, fieldList: {[reportFieldKey]: reportField}});
            await waitForBatchedUpdates();
            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(fakePolicy.id);

            ReportField.updateReportFieldInitialValue({policy, reportFieldID, newInitialValue});
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(fakePolicy.id);

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

            policy = await connectToFetchPolicy(fakePolicy.id);

            // Check if the policy pending action was cleared
            expect(policy?.fieldList?.[reportFieldKey].pendingAction).toBeFalsy();
        });

        it('updates the initial value of a text report field when api returns an error', async () => {
            mockFetch.pause();

            const fakePolicy = createRandomPolicy(0);
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

            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy?.id}`, {...fakePolicy, fieldList: {[reportFieldKey]: reportField}});
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(fakePolicy.id);

            ReportField.updateReportFieldInitialValue({policy, reportFieldID, newInitialValue});
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(fakePolicy.id);

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

            policy = await connectToFetchPolicy(fakePolicy.id);

            // check if the updated report field was reset in the policy
            expect(policy?.fieldList).toStrictEqual<PolicyReportFieldWithOfflineFeedback>({
                [reportFieldKey]: reportField,
            });
            // Check if the policy errors was set
            expect(policy?.errorFields?.fieldList?.[reportFieldKey]).toBeTruthy();
        });

        it('reverts optimistic type to text when new initial value is non-formula', async () => {
            mockFetch.pause();
            Onyx.set(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {});
            await waitForBatchedUpdates();

            const fakePolicy = createRandomPolicy(0);
            const reportFieldName = 'Auto Formula From Text';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);

            // Create from TEXT with formula-like initial value -> optimistically becomes FORMULA
            ReportField.createReportField({
                policy: fakePolicy,
                name: reportFieldName,
                type: CONST.REPORT_FIELD_TYPES.TEXT,
                initialValue: '{report:id}',
                listValues: [],
                disabledListValues: [],
                policyReportIDs: [],
            });
            await waitForBatchedUpdates();

            // Now update initial value to non-formula -> should optimistically switch back to TEXT
            ReportField.updateReportFieldInitialValue({policy: fakePolicy, reportFieldID, newInitialValue: 'plain text'});
            await waitForBatchedUpdates();

            const policy = await connectToFetchPolicy(fakePolicy.id);
            expect(policy?.fieldList?.[reportFieldKey]?.type).toBe(CONST.REPORT_FIELD_TYPES.TEXT);
            expect(policy?.fieldList?.[reportFieldKey]?.defaultValue).toBe('plain text');
        });

        it('upgrades optimistic type to formula when text field gets a formula initial value', async () => {
            mockFetch.pause();

            const fakePolicy = createRandomPolicy(0);
            const reportFieldName = 'TextThenFormula';
            const reportFieldID = generateFieldID(reportFieldName);
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);

            // Start with normal TEXT field
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy?.id}`, {
                ...fakePolicy,
                fieldList: {
                    [reportFieldKey]: {
                        name: reportFieldName,
                        type: CONST.REPORT_FIELD_TYPES.TEXT,
                        target: 'expense',
                        defaultValue: 'hello',
                        values: [],
                        disabledOptions: [],
                        fieldID: reportFieldID,
                        orderWeight: 1,
                        deletable: false,
                        keys: [],
                        externalIDs: [],
                        isTax: false,
                    },
                },
            });
            await waitForBatchedUpdates();

            // Update to a formula-like value -> should become FORMULA optimistically
            ReportField.updateReportFieldInitialValue({policy: fakePolicy, reportFieldID, newInitialValue: '{report:type}'});
            await waitForBatchedUpdates();

            const policy = await connectToFetchPolicy(fakePolicy.id);
            expect(policy?.fieldList?.[reportFieldKey]?.type).toBe(CONST.REPORT_FIELD_TYPES.FORMULA);
            expect(policy?.fieldList?.[reportFieldKey]?.defaultValue).toBe('{report:type}');
        });
    });

    describe('updateReportFieldListValueEnabled', () => {
        it('updates the enabled flag of report field list values', async () => {
            mockFetch.pause();

            const fakePolicy = createRandomPolicy(0);
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

            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy?.id}`, {...fakePolicy, fieldList: {[reportFieldKey]: reportField}});
            await waitForBatchedUpdates();
            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(fakePolicy.id);
            ReportField.updateReportFieldListValueEnabled({policy, reportFieldID, valueIndexes: valueIndexesTpUpdate, enabled: false});
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(fakePolicy.id);

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

            const fakePolicy = createRandomPolicy(0);
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
            const newListValueName = 'Value 4';

            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy?.id}`, {...fakePolicy, fieldList: {[reportFieldKey]: reportField}});
            await waitForBatchedUpdates();
            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(fakePolicy.id);
            ReportField.addReportFieldListValue({policy, reportFieldID, valueName: newListValueName});
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(fakePolicy.id);
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
            const fakePolicy = createRandomPolicy(0);

            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy?.id}`, {...fakePolicy, fieldList: {[reportFieldKey]: reportField}});
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await connectToFetchPolicy(fakePolicy.id);
            ReportField.removeReportFieldListValue({policy, reportFieldID, valueIndexes: [1, 2]});
            await waitForBatchedUpdates();

            policy = await connectToFetchPolicy(fakePolicy.id);

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

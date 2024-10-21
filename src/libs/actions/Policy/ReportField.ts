import cloneDeep from 'lodash/cloneDeep';
import type {NullishDeep, OnyxCollection, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {
    CreateWorkspaceReportFieldListValueParams,
    CreateWorkspaceReportFieldParams,
    DeletePolicyReportField,
    EnableWorkspaceReportFieldListValueParams,
    OpenPolicyReportFieldsPageParams,
    RemoveWorkspaceReportFieldListValueParams,
    UpdateWorkspaceReportFieldInitialValueParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import * as ReportConnection from '@libs/ReportConnection';
import * as ReportUtils from '@libs/ReportUtils';
import * as WorkspaceReportFieldUtils from '@libs/WorkspaceReportFieldUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WorkspaceReportFieldForm} from '@src/types/form/WorkspaceReportFieldForm';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import type {Policy, PolicyReportField, Report} from '@src/types/onyx';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';
import type {OnyxData} from '@src/types/onyx/Request';
import execPolicyWriteCommand from './execPolicyWriteCommand';

let listValues: string[];
let disabledListValues: boolean[];
Onyx.connect({
    key: ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT,
    callback: (value) => {
        if (!value) {
            return;
        }

        listValues = value[INPUT_IDS.LIST_VALUES] ?? [];
        disabledListValues = value[INPUT_IDS.DISABLED_LIST_VALUES] ?? [];
    },
});

const allPolicies: OnyxCollection<Policy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (value, key) => {
        if (!key) {
            return;
        }
        if (value === null || value === undefined) {
            // If we are deleting a policy, we have to check every report linked to that policy
            // and unset the draft indicator (pencil icon) alongside removing any draft comments. Clearing these values will keep the newly archived chats from being displayed in the LHN.
            // More info: https://github.com/Expensify/App/issues/14260
            const policyID = key.replace(ONYXKEYS.COLLECTION.POLICY, '');
            const policyReports = ReportUtils.getAllPolicyReports(policyID);
            const cleanUpMergeQueries: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, NullishDeep<Report>> = {};
            const cleanUpSetQueries: Record<`${typeof ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${string}` | `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${string}`, null> = {};
            policyReports.forEach((policyReport) => {
                if (!policyReport) {
                    return;
                }
                const {reportID} = policyReport;
                cleanUpSetQueries[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] = null;
                cleanUpSetQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`] = null;
            });
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, cleanUpMergeQueries);
            Onyx.multiSet(cleanUpSetQueries);
            delete allPolicies[key];
            return;
        }

        allPolicies[key] = value;
    },
});

function openPolicyReportFieldsPage(policyID: string) {
    if (!policyID) {
        Log.warn('openPolicyReportFieldsPage invalid params', {policyID});
        return;
    }

    const params: OpenPolicyReportFieldsPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_REPORT_FIELDS_PAGE, params);
}

/**
 * Sets the initial form values for the workspace report fields form.
 */
function setInitialCreateReportFieldsForm() {
    Onyx.set(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
        [INPUT_IDS.INITIAL_VALUE]: '',
    });
}

/**
 * Creates a new list value in the workspace report fields form.
 */
function createReportFieldsListValue(valueName: string) {
    Onyx.merge(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
        [INPUT_IDS.LIST_VALUES]: [...listValues, valueName],
        [INPUT_IDS.DISABLED_LIST_VALUES]: [...disabledListValues, false],
    });
}

/**
 * Renames a list value in the workspace report fields form.
 */
function renameReportFieldsListValue(valueIndex: number, newValueName: string) {
    const listValuesCopy = [...listValues];
    listValuesCopy[valueIndex] = newValueName;

    Onyx.merge(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
        [INPUT_IDS.LIST_VALUES]: listValuesCopy,
    });
}

/**
 * Sets the enabled state of a list value in the workspace report fields form.
 */
function setReportFieldsListValueEnabled(valueIndexes: number[], enabled: boolean) {
    const disabledListValuesCopy = [...disabledListValues];

    valueIndexes.forEach((valueIndex) => {
        disabledListValuesCopy[valueIndex] = !enabled;
    });

    Onyx.merge(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
        [INPUT_IDS.DISABLED_LIST_VALUES]: disabledListValuesCopy,
    });
}

/**
 * Deletes a list value from the workspace report fields form.
 */
function deleteReportFieldsListValue(valueIndexes: number[]) {
    const listValuesCopy = [...listValues];
    const disabledListValuesCopy = [...disabledListValues];

    valueIndexes
        .sort((a, b) => b - a)
        .forEach((valueIndex) => {
            listValuesCopy.splice(valueIndex, 1);
            disabledListValuesCopy.splice(valueIndex, 1);
        });

    Onyx.merge(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
        [INPUT_IDS.LIST_VALUES]: listValuesCopy,
        [INPUT_IDS.DISABLED_LIST_VALUES]: disabledListValuesCopy,
    });
}

type CreateReportFieldArguments = Pick<WorkspaceReportFieldForm, 'name' | 'type' | 'initialValue'>;

/**
 * Creates a new report field.
 */
function createReportField(policyID: string, {name, type, initialValue}: CreateReportFieldArguments) {
    const previousFieldList = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.fieldList ?? {};
    const fieldID = WorkspaceReportFieldUtils.generateFieldID(name);
    const fieldKey = ReportUtils.getReportFieldKey(fieldID);
    const newReportField: Omit<OnyxValueWithOfflineFeedback<PolicyReportField>, 'value'> = {
        name,
        type,
        defaultValue: initialValue,
        values: listValues,
        disabledOptions: disabledListValues,
        fieldID,
        orderWeight: Object.keys(previousFieldList).length + 1,
        deletable: false,
        keys: [],
        externalIDs: [],
        isTax: false,
    };

    const optimisticReportFieldDataForPolicy: OnyxValueWithOfflineFeedback<PolicyReportField> = {
        ...newReportField,
        value: type === CONST.REPORT_FIELD_TYPES.LIST ? CONST.REPORT_FIELD_TYPES.LIST : null,
    };

    const policyExpenseReports = Object.values(ReportConnection.getAllReports() ?? {}).filter(
        (report) => report?.policyID === policyID && report.type === CONST.REPORT.TYPE.EXPENSE,
    ) as Report[];

    const optimisticData = [
        {
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            onyxMethod: Onyx.METHOD.MERGE,
            value: {
                fieldList: {
                    [fieldKey]: {...optimisticReportFieldDataForPolicy, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                },
                errorFields: null,
            },
        },
        ...policyExpenseReports.map((report) => ({
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            onyxMethod: Onyx.METHOD.MERGE,
            value: {
                fieldList: {
                    [fieldKey]: {...newReportField, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                },
            },
        })),
    ] as OnyxUpdate[];

    const failureData = [
        {
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            onyxMethod: Onyx.METHOD.MERGE,
            value: {
                fieldList: {
                    [fieldKey]: null,
                },
                errorFields: {
                    [fieldKey]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.reportFields.genericFailureMessage'),
                },
            },
        },
        ...policyExpenseReports.map((report) => ({
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            onyxMethod: Onyx.METHOD.MERGE,
            value: {
                fieldList: {
                    [fieldKey]: null,
                },
            },
        })),
    ] as OnyxUpdate[];

    const onyxData: OnyxData = {
        optimisticData,
        successData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    fieldList: {
                        [fieldKey]: {pendingAction: null},
                    },
                    errorFields: null,
                },
            },
        ],
        failureData,
    };

    const parameters: CreateWorkspaceReportFieldParams = {
        policyID,
        reportFields: JSON.stringify([newReportField]),
    };

    API.write(WRITE_COMMANDS.CREATE_WORKSPACE_REPORT_FIELD, parameters, onyxData);
}

function deleteReportFields(policyID: string, reportFieldsToUpdate: string[]) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const allReportFields = policy?.fieldList ?? {};

    const updatedReportFields = Object.fromEntries(Object.entries(allReportFields).filter(([key]) => !reportFieldsToUpdate.includes(key)));
    const optimisticReportFields = reportFieldsToUpdate.reduce<Record<string, Partial<OnyxValueWithOfflineFeedback<PolicyReportField>>>>((acc, reportFieldKey) => {
        acc[reportFieldKey] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        return acc;
    }, {});

    const successReportFields = reportFieldsToUpdate.reduce<Record<string, null>>((acc, reportFieldKey) => {
        acc[reportFieldKey] = null;
        return acc;
    }, {});

    const failureReportFields = reportFieldsToUpdate.reduce<Record<string, Partial<OnyxValueWithOfflineFeedback<PolicyReportField>>>>((acc, reportFieldKey) => {
        acc[reportFieldKey] = {pendingAction: null};
        return acc;
    }, {});

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    fieldList: optimisticReportFields,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    fieldList: successReportFields,
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    fieldList: failureReportFields,
                    errorFields: {
                        fieldList: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        ],
    };

    const parameters: DeletePolicyReportField = {
        policyID,
        reportFields: JSON.stringify(Object.values(updatedReportFields)),
    };

    API.write(WRITE_COMMANDS.DELETE_POLICY_REPORT_FIELD, parameters, onyxData);
}

/**
 * Updates the initial value of a report field.
 */
function updateReportFieldInitialValue(policyID: string, reportFieldID: string, newInitialValue: string) {
    const previousFieldList = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.fieldList ?? {};
    const fieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    const updatedReportField: PolicyReportField = {
        ...previousFieldList[fieldKey],
        defaultValue: newInitialValue,
    };
    const onyxData: OnyxData = {
        optimisticData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    fieldList: {
                        [fieldKey]: {...updatedReportField, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    },
                    errorFields: null,
                },
            },
        ],
        successData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    fieldList: {
                        [fieldKey]: {pendingAction: null},
                    },
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    fieldList: {
                        [fieldKey]: {...previousFieldList[fieldKey], pendingAction: null},
                    },
                    errorFields: {
                        [fieldKey]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.reportFields.genericFailureMessage'),
                    },
                },
            },
        ],
    };
    const parameters: UpdateWorkspaceReportFieldInitialValueParams = {
        policyID,
        reportFields: JSON.stringify([updatedReportField]),
    };

    execPolicyWriteCommand(WRITE_COMMANDS.UPDATE_WORKSPACE_REPORT_FIELD_INITIAL_VALUE, parameters, onyxData);
}

function updateReportFieldListValueEnabled(policyID: string, reportFieldID: string, valueIndexes: number[], enabled: boolean) {
    const previousFieldList = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.fieldList ?? {};
    const fieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    const reportField = previousFieldList[fieldKey];

    const updatedReportField = cloneDeep(reportField);

    valueIndexes.forEach((valueIndex) => {
        updatedReportField.disabledOptions[valueIndex] = !enabled;
        const shouldResetDefaultValue = !enabled && reportField.defaultValue === reportField.values.at(valueIndex);

        if (shouldResetDefaultValue) {
            updatedReportField.defaultValue = '';
        }
    });

    // We are using the offline pattern A (optimistic without feedback)
    const onyxData: OnyxData = {
        optimisticData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    fieldList: {
                        [fieldKey]: updatedReportField,
                    },
                },
            },
        ],
    };

    const parameters: EnableWorkspaceReportFieldListValueParams = {
        policyID,
        reportFields: JSON.stringify([updatedReportField]),
    };

    execPolicyWriteCommand(WRITE_COMMANDS.ENABLE_WORKSPACE_REPORT_FIELD_LIST_VALUE, parameters, onyxData);
}

/**
 * Adds a new option to the list type report field on a workspace.
 */
function addReportFieldListValue(policyID: string, reportFieldID: string, valueName: string) {
    const previousFieldList = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.fieldList ?? {};
    const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    const reportField = previousFieldList[reportFieldKey];
    const updatedReportField = cloneDeep(reportField);

    updatedReportField.values.push(valueName);
    updatedReportField.disabledOptions.push(false);

    // We are using the offline pattern A (optimistic without feedback)
    const onyxData: OnyxData = {
        optimisticData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    fieldList: {
                        [reportFieldKey]: updatedReportField,
                    },
                },
            },
        ],
    };

    const parameters: CreateWorkspaceReportFieldListValueParams = {
        policyID,
        reportFields: JSON.stringify([updatedReportField]),
    };

    API.write(WRITE_COMMANDS.CREATE_WORKSPACE_REPORT_FIELD_LIST_VALUE, parameters, onyxData);
}

/**
 * Removes a list value from the workspace report fields.
 */
function removeReportFieldListValue(policyID: string, reportFieldID: string, valueIndexes: number[]) {
    const previousFieldList = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.fieldList ?? {};
    const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    const reportField = previousFieldList[reportFieldKey];
    const updatedReportField = cloneDeep(reportField);

    valueIndexes
        .sort((a, b) => b - a)
        .forEach((valueIndex) => {
            const shouldResetDefaultValue = reportField.defaultValue === reportField.values.at(valueIndex);

            if (shouldResetDefaultValue) {
                updatedReportField.defaultValue = '';
            }

            updatedReportField.values.splice(valueIndex, 1);
            updatedReportField.disabledOptions.splice(valueIndex, 1);
        });

    // We are using the offline pattern A (optimistic without feedback)
    const onyxData: OnyxData = {
        optimisticData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    fieldList: {
                        [reportFieldKey]: updatedReportField,
                    },
                },
            },
        ],
    };

    const parameters: RemoveWorkspaceReportFieldListValueParams = {
        policyID,
        reportFields: JSON.stringify([updatedReportField]),
    };

    API.write(WRITE_COMMANDS.REMOVE_WORKSPACE_REPORT_FIELD_LIST_VALUE, parameters, onyxData);
}

export type {CreateReportFieldArguments};

export {
    setInitialCreateReportFieldsForm,
    createReportFieldsListValue,
    renameReportFieldsListValue,
    setReportFieldsListValueEnabled,
    deleteReportFieldsListValue,
    createReportField,
    deleteReportFields,
    updateReportFieldInitialValue,
    updateReportFieldListValueEnabled,
    openPolicyReportFieldsPage,
    addReportFieldListValue,
    removeReportFieldListValue,
};

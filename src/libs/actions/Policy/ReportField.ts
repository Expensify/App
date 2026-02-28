import cloneDeep from 'lodash/cloneDeep';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
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
import * as ReportUtils from '@libs/ReportUtils';
import * as WorkspaceReportFieldUtils from '@libs/WorkspaceReportFieldUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WorkspaceReportFieldForm} from '@src/types/form/WorkspaceReportFieldForm';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import type {Policy, PolicyReportField} from '@src/types/onyx';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';
import type {OnyxData} from '@src/types/onyx/Request';

type CreateReportFieldsListValueParams = {
    valueName: string;
    listValues: string[];
    disabledListValues: boolean[];
};

type RenameReportFieldsListValueParams = {
    valueIndex: number;
    newValueName: string;
    listValues: string[];
};

type SetReportFieldsListValueEnabledParams = {
    valueIndexes: number[];
    enabled: boolean;
    disabledListValues: boolean[];
};

type DeleteReportFieldsListValueParams = {
    valueIndexes: number[];
    listValues: string[];
    disabledListValues: boolean[];
};

type CreateReportFieldParams = Pick<WorkspaceReportFieldForm, 'name' | 'type' | 'initialValue'> & {
    listValues: string[];
    disabledListValues: boolean[];
    policyExpenseReportIDs: Array<string | undefined> | undefined;
    policy: OnyxEntry<Policy>;
};

type DeleteReportFieldsParams = {
    reportFieldsToUpdate: string[];
    policy: OnyxEntry<Policy>;
};

type RemoveReportFieldListValueParams = {
    valueIndexes: number[];
    reportFieldID: string;
    policy: OnyxEntry<Policy>;
};

type AddReportFieldListValueParams = {
    valueName: string;
    reportFieldID: string;
    policy: OnyxEntry<Policy>;
};

type UpdateReportFieldListValueEnabledParams = {
    valueIndexes: number[];
    enabled: boolean;
    reportFieldID: string;
    policy: OnyxEntry<Policy>;
};

type UpdateReportFieldInitialValueParams = {
    newInitialValue: string;
    reportFieldID: string;
    policy: OnyxEntry<Policy>;
};

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
function createReportFieldsListValue({valueName, listValues, disabledListValues}: CreateReportFieldsListValueParams) {
    Onyx.merge(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
        [INPUT_IDS.LIST_VALUES]: [...listValues, valueName],
        [INPUT_IDS.DISABLED_LIST_VALUES]: [...disabledListValues, false],
    });
}

/**
 * Renames a list value in the workspace report fields form.
 */
function renameReportFieldsListValue({valueIndex, newValueName, listValues}: RenameReportFieldsListValueParams) {
    const listValuesCopy = [...listValues];
    listValuesCopy[valueIndex] = newValueName;

    Onyx.merge(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
        [INPUT_IDS.LIST_VALUES]: listValuesCopy,
    });
}

/**
 * Sets the enabled state of a list value in the workspace report fields form.
 */
function setReportFieldsListValueEnabled({valueIndexes, enabled, disabledListValues}: SetReportFieldsListValueEnabledParams) {
    const disabledListValuesCopy = [...disabledListValues];

    for (const valueIndex of valueIndexes) {
        disabledListValuesCopy[valueIndex] = !enabled;
    }

    Onyx.merge(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
        [INPUT_IDS.DISABLED_LIST_VALUES]: disabledListValuesCopy,
    });
}

/**
 * Deletes a list value from the workspace report fields form.
 */
function deleteReportFieldsListValue({valueIndexes, listValues, disabledListValues}: DeleteReportFieldsListValueParams) {
    const listValuesCopy = [...listValues];
    const disabledListValuesCopy = [...disabledListValues];

    for (const valueIndex of valueIndexes.sort((a, b) => b - a)) {
        listValuesCopy.splice(valueIndex, 1);
        disabledListValuesCopy.splice(valueIndex, 1);
    }

    Onyx.merge(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
        [INPUT_IDS.LIST_VALUES]: listValuesCopy,
        [INPUT_IDS.DISABLED_LIST_VALUES]: disabledListValuesCopy,
    });
}

/**
 * Creates a new report field.
 */
function createReportField({name, type, initialValue, listValues, disabledListValues, policyExpenseReportIDs, policy}: CreateReportFieldParams) {
    if (!policy) {
        Log.warn('Policy data is not present');
        return;
    }

    const previousFieldList = policy?.fieldList ?? {};
    const fieldID = WorkspaceReportFieldUtils.generateFieldID(name);
    const fieldKey = ReportUtils.getReportFieldKey(fieldID);

    // User selected type Text but entered a formula Initial value, treat it as a Formula type for optimistic UI
    const shouldTreatTextAsFormula = type === CONST.REPORT_FIELD_TYPES.TEXT && WorkspaceReportFieldUtils.hasFormulaPartsInInitialValue(initialValue);
    const optimisticType = shouldTreatTextAsFormula ? CONST.REPORT_FIELD_TYPES.FORMULA : type;

    const optimisticReportFieldDataForPolicy: Omit<OnyxValueWithOfflineFeedback<PolicyReportField>, 'value'> = {
        name,
        type: optimisticType,
        target: 'expense',
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
            onyxMethod: Onyx.METHOD.MERGE,
            value: {
                fieldList: {
                    [fieldKey]: {...optimisticReportFieldDataForPolicy, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                },
                errorFields: null,
            },
        },
        ...(policyExpenseReportIDs ?? []).map(
            (reportID): OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> => ({
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    fieldList: {
                        [fieldKey]: {...optimisticReportFieldDataForPolicy, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                    },
                },
            }),
        ),
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
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
        ...(policyExpenseReportIDs ?? []).map(
            (reportID): OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> => ({
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    fieldList: {
                        [fieldKey]: null,
                    },
                },
            }),
        ),
    ];

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT> = {
        optimisticData,
        successData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
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
        policyID: policy?.id,
        reportFields: JSON.stringify([optimisticReportFieldDataForPolicy]),
    };

    API.write(WRITE_COMMANDS.CREATE_WORKSPACE_REPORT_FIELD, parameters, onyxData);
}

function deleteReportFields({policy, reportFieldsToUpdate}: DeleteReportFieldsParams) {
    if (!policy) {
        Log.warn('Policy data is not present');
        return;
    }

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

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
                value: {
                    fieldList: optimisticReportFields,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
                value: {
                    fieldList: successReportFields,
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
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
        policyID: policy?.id,
        reportFields: JSON.stringify(Object.values(updatedReportFields)),
    };

    API.write(WRITE_COMMANDS.DELETE_POLICY_REPORT_FIELD, parameters, onyxData);
}

/**
 * Updates the initial value of a report field.
 */
function updateReportFieldInitialValue({policy, reportFieldID, newInitialValue}: UpdateReportFieldInitialValueParams) {
    if (!policy) {
        Log.warn('Policy data is not present');
        return;
    }

    const previousFieldList = policy?.fieldList ?? {};
    const fieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    const existingField = previousFieldList[fieldKey];

    // Dynamically adjust type for text/formula fields based on the new initial value for optimistic UI
    let nextType = existingField?.type;
    const isTextOrFormula = existingField?.type === CONST.REPORT_FIELD_TYPES.TEXT || existingField?.type === CONST.REPORT_FIELD_TYPES.FORMULA;
    if (isTextOrFormula || !existingField) {
        nextType = WorkspaceReportFieldUtils.hasFormulaPartsInInitialValue(newInitialValue) ? CONST.REPORT_FIELD_TYPES.FORMULA : CONST.REPORT_FIELD_TYPES.TEXT;
    }

    const updatedReportField: PolicyReportField = {
        ...existingField,
        type: nextType,
        defaultValue: newInitialValue,
    };
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
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
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
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
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
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
        policyID: policy?.id,
        reportFields: JSON.stringify([updatedReportField]),
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_REPORT_FIELD_INITIAL_VALUE, parameters, onyxData);
}

function updateReportFieldListValueEnabled({policy, reportFieldID, valueIndexes, enabled}: UpdateReportFieldListValueEnabledParams) {
    if (!policy) {
        Log.warn('Policy data is not present');
        return;
    }

    const previousFieldList = policy?.fieldList ?? {};
    const fieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    const reportField = previousFieldList[fieldKey];

    const updatedReportField = cloneDeep(reportField);

    for (const valueIndex of valueIndexes) {
        updatedReportField.disabledOptions[valueIndex] = !enabled;
        const shouldResetDefaultValue = !enabled && reportField.defaultValue === reportField.values.at(valueIndex);

        if (shouldResetDefaultValue) {
            updatedReportField.defaultValue = '';
        }
    }

    // We are using the offline pattern A (optimistic without feedback)
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
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
        policyID: policy?.id,
        reportFields: JSON.stringify([updatedReportField]),
    };

    API.write(WRITE_COMMANDS.ENABLE_WORKSPACE_REPORT_FIELD_LIST_VALUE, parameters, onyxData);
}

/**
 * Adds a new option to the list type report field on a workspace.
 */
function addReportFieldListValue({policy, reportFieldID, valueName}: AddReportFieldListValueParams) {
    if (!policy) {
        Log.warn('Policy data is not present');
        return;
    }

    const previousFieldList = policy?.fieldList ?? {};
    const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    const reportField = previousFieldList[reportFieldKey];
    const updatedReportField = cloneDeep(reportField);

    updatedReportField.values.push(valueName);
    updatedReportField.disabledOptions.push(false);

    // We are using the offline pattern A (optimistic without feedback)
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
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
        policyID: policy?.id,
        reportFields: JSON.stringify([updatedReportField]),
    };

    API.write(WRITE_COMMANDS.CREATE_WORKSPACE_REPORT_FIELD_LIST_VALUE, parameters, onyxData);
}

/**
 * Removes a list value from the workspace report fields.
 */
function removeReportFieldListValue({policy, reportFieldID, valueIndexes}: RemoveReportFieldListValueParams) {
    if (!policy) {
        Log.warn('Policy data is not present');
        return;
    }

    const previousFieldList = policy?.fieldList ?? {};
    const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    const reportField = previousFieldList[reportFieldKey];
    const updatedReportField = cloneDeep(reportField);

    for (const valueIndex of valueIndexes.sort((a, b) => b - a)) {
        const shouldResetDefaultValue = reportField.defaultValue === reportField.values.at(valueIndex);

        if (shouldResetDefaultValue) {
            updatedReportField.defaultValue = '';
        }

        updatedReportField.values.splice(valueIndex, 1);
        updatedReportField.disabledOptions.splice(valueIndex, 1);
    }

    // We are using the offline pattern A (optimistic without feedback)
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
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
        policyID: policy?.id,
        reportFields: JSON.stringify([updatedReportField]),
    };

    API.write(WRITE_COMMANDS.REMOVE_WORKSPACE_REPORT_FIELD_LIST_VALUE, parameters, onyxData);
}

export type {CreateReportFieldParams};

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

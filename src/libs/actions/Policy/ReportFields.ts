import type {NullishDeep, OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {CreateWorkspaceReportFieldParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ReportUtils from '@libs/ReportUtils';
import {generateFieldID} from '@libs/WorkspaceReportFieldsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WorkspaceReportFieldsForm} from '@src/types/form/WorkspaceReportFieldsForm';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldsForm';
import type {Policy, PolicyReportField} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';

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

type CreateReportFieldArguments = Pick<WorkspaceReportFieldsForm, 'name' | 'type' | 'initialValue'>;

/**
 * Creates a new report field.
 */
function createReportField(policyID: string, {name, type, initialValue}: CreateReportFieldArguments) {
    const previousFieldList = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.fieldList ?? {};
    const fieldID = generateFieldID(name);
    const fieldKey = ReportUtils.getReportFieldKey(fieldID);
    const newReportField: PolicyReportField = {
        name,
        type,
        defaultValue: initialValue,
        values: listValues,
        disabledOptions: disabledListValues,
        fieldID,
        orderWeight: Object.keys(previousFieldList).length + 1,
        deletable: false,
        value: type === CONST.REPORT_FIELD_TYPES.LIST ? CONST.REPORT_FIELD_TYPES.LIST : null,
        keys: [],
        externalIDs: [],
        isTax: false,
    };
    const onyxData: OnyxData = {
        optimisticData: [
            {
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    fieldList: {
                        [fieldKey]: newReportField,
                    },
                    pendingFields: {
                        [fieldKey]: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
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
                    pendingFields: {
                        [fieldKey]: null,
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
                        [fieldKey]: null,
                    },
                    pendingFields: {
                        [fieldKey]: null,
                    },
                    errorFields: {
                        [fieldKey]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.reportFields.genericFailureMessage'),
                    },
                },
            },
        ],
    };
    const parameters: CreateWorkspaceReportFieldParams = {
        policyID,
        reportFields: JSON.stringify([newReportField]),
    };

    API.write(WRITE_COMMANDS.CREATE_WORKSPACE_REPORT_FIELD, parameters, onyxData);
}

export type {CreateReportFieldArguments};

export {setInitialCreateReportFieldsForm, createReportFieldsListValue, renameReportFieldsListValue, setReportFieldsListValueEnabled, deleteReportFieldsListValue, createReportField};

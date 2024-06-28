import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {CreateWorkspaceReportFieldParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
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

let allPolicies: OnyxCollection<Policy>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
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
                        [fieldID]: newReportField,
                    },
                    pendingFields: {
                        [fieldID]: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
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
                        [fieldID]: null,
                    },
                    pendingFields: {
                        [fieldID]: null,
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
                    fieldList: previousFieldList,
                    pendingFields: {
                        [fieldID]: null,
                    },
                    errorFields: {
                        [fieldID]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.reportFields.genericFailureMessage'),
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

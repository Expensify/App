import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WorkspaceReportFieldsForm} from '@src/types/form/WorkspaceReportFieldsForm';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldsForm';

let formDraft: WorkspaceReportFieldsForm;
Onyx.connect({
    key: ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT,
    callback: (value) => {
        if (!value) {
            return;
        }

        formDraft = value;
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
        [INPUT_IDS.LIST_VALUES]: {
            [valueName]: {
                name: valueName,
                disabled: false,
            },
        },
    });
}

/**
 * Renames a list value in the workspace report fields form.
 */
function renameReportFieldsListValue(oldValueName: string, newValueName: string) {
    Onyx.merge(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
        [INPUT_IDS.LIST_VALUES]: {
            [oldValueName]: null,
            [newValueName]: {
                name: newValueName,
                disabled: formDraft?.listValues?.[oldValueName]?.disabled ?? false,
            },
        },
    });
}

function setReportFieldsListValueEnabled(valueName: string, enabled: boolean) {
    Onyx.merge(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
        [INPUT_IDS.LIST_VALUES]: {
            [valueName]: {
                disabled: !enabled,
            },
        },
    });
}

export {setInitialCreateReportFieldsForm, createReportFieldsListValue, renameReportFieldsListValue, setReportFieldsListValueEnabled};

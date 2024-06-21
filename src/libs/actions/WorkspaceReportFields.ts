import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldsForm';

/**
 * Sets the initial form values for the workspace report fields form.
 */
function setInitialCreateReportFieldsForm() {
    Onyx.set(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {
        [INPUT_IDS.INITIAL_VALUE]: '',
    });
}

// eslint-disable-next-line import/prefer-default-export
export {setInitialCreateReportFieldsForm};

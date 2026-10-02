import type {DynamicFormValues} from '@components/DynamicForm/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxFormKey} from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** A dynamic form's keys come from its schema, so they are merged into the draft without its Onyx type listing them */
function saveDraftAnswers(formID: OnyxFormKey, answers: DynamicFormValues) {
    Onyx.merge(`${formID}Draft`, answers);
}

function saveSensitiveAnswers(formID: OnyxFormKey, answers: Record<string, string>) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {[formID]: answers});
}

/** Call once the form is submitted or abandoned, so sensitive answers do not outlive the visit */
function clearSensitiveAnswers(formID: OnyxFormKey) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {[formID]: null});
}

export {clearSensitiveAnswers, saveDraftAnswers, saveSensitiveAnswers};

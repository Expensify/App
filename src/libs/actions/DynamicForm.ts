import type {DynamicFormValues} from '@components/DynamicForm/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxFormKey} from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** A dynamic form's keys come from its schema, so they are merged into the draft without its Onyx type listing them */
function saveDraftAnswers(formID: OnyxFormKey, answers: DynamicFormValues) {
    Onyx.merge(`${formID}Draft`, answers);
}

/** Sensitive answers live in memory only, so they reach the next page of the flow but are never written to the draft */
function saveSensitiveAnswers(formID: OnyxFormKey, answers: DynamicFormValues) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {[formID]: answers});
}

/** Drops some sensitive answers, such as those of a list entry the user removed */
function forgetSensitiveAnswers(formID: OnyxFormKey, keys: string[]) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {[formID]: Object.fromEntries(keys.map((key) => [key, null]))});
}

/** Fills the list entry editor with the entry's answers, or empties it for a new entry */
function startListItemEdit(answers: DynamicFormValues): Promise<void> {
    return Onyx.set(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT, answers);
}

/** Empties the list entry editor once it closes, so an entry's answers are not left in its draft */
function clearListItemEdit() {
    Onyx.set(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT, null);
}

/** Call once the form is submitted or abandoned, so sensitive answers do not outlive the visit */
function clearSensitiveAnswers(formID: OnyxFormKey) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {[formID]: null});
}

export {clearListItemEdit, clearSensitiveAnswers, forgetSensitiveAnswers, saveDraftAnswers, saveSensitiveAnswers, startListItemEdit};

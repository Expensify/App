import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxFormKey} from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

function saveSensitiveAnswers(formID: OnyxFormKey, answers: Record<string, string>) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {[formID]: answers});
}

/** Call once the form is submitted or abandoned, so sensitive answers do not outlive the visit */
function clearSensitiveAnswers(formID: OnyxFormKey) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {[formID]: null});
}

export {clearSensitiveAnswers, saveSensitiveAnswers};

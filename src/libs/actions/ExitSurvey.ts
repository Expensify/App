import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

let exitReason: ValueOf<typeof CONST.EXIT_SURVEY.REASONS> | undefined;
let exitSurveyResponse: string | undefined;
Onyx.connect({
    key: ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM,
    callback: (value) => (exitReason = value?.[CONST.EXIT_SURVEY.REASON_INPUT_ID]),
});
Onyx.connect({
    key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM,
    callback: (value) => (exitSurveyResponse = value?.[CONST.EXIT_SURVEY.RESPONSE_INPUT_ID]),
});

function saveExitReason(reason: ValueOf<typeof CONST.EXIT_SURVEY.REASONS>) {
    Onyx.merge(ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM, {[CONST.EXIT_SURVEY.REASON_INPUT_ID]: reason});
}

function saveResponse(response: string) {
    Onyx.merge(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {[CONST.EXIT_SURVEY.RESPONSE_INPUT_ID]: response});
}

/**
 * Save the user's response to the mandatory exit survey in the back-end.
 */
function switchToOldDot() {
    if (!exitReason || !exitSurveyResponse) {
        Log.hmmm('Attempted to call SwitchToOldDot without filling out mandatory survey.');
        return;
    }

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM_DRAFT,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT,
            value: null,
        },
    ];

    API.write(
        'SwitchToOldDot',
        {
            reason: exitReason,
            surveyResponse: exitSurveyResponse,
        },
        {finallyData},
    );
}

export {saveExitReason, saveResponse, switchToOldDot};

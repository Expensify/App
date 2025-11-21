import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import RESPONSE_INPUT_IDS from '@src/types/form/ExitSurveyResponseForm';

function saveResponse(response: string) {
    Onyx.set(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {[RESPONSE_INPUT_IDS.RESPONSE]: response});
}

/**
 * Save the user's response to the mandatory exit survey in the back-end.
 */
function switchToOldDot(exitSurveyResponse: string | undefined) {
    const optimisticData: OnyxUpdate[] = [
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

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.write(
        WRITE_COMMANDS.SWITCH_TO_OLD_DOT,
        {
            surveyResponse: exitSurveyResponse,
        },
        {optimisticData},
    );
}

/**
 * Clear the exit survey form data.
 */
function resetExitSurveyForm(callback: () => void) {
    Onyx.multiSet({
        [ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM]: null,
        [ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT]: null,
    }).then(callback);
}

export {saveResponse, switchToOldDot, resetExitSurveyForm};

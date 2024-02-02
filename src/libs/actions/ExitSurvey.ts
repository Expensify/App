import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ExitReason = ValueOf<typeof CONST.EXIT_SURVEY.REASONS>;

let exitReason: ExitReason | undefined;
let exitSurveyResponse: string | undefined;
Onyx.connect({
    key: ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM,
    callback: (value) => (exitReason = value?.[CONST.EXIT_SURVEY.REASON_INPUT_ID]),
});
Onyx.connect({
    key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM,
    callback: (value) => (exitSurveyResponse = value?.[CONST.EXIT_SURVEY.RESPONSE_INPUT_ID]),
});

function saveExitReason(reason: ExitReason) {
    Onyx.set(ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM, {[CONST.EXIT_SURVEY.REASON_INPUT_ID]: reason});
}

function saveResponse(response: string) {
    Onyx.set(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {[CONST.EXIT_SURVEY.RESPONSE_INPUT_ID]: response});
}

/**
 * Save the user's response to the mandatory exit survey in the back-end.
 */
function switchToOldDot() {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_SWITCHING_TO_OLD_DOT,
            value: true,
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_SWITCHING_TO_OLD_DOT,
            value: false,
        },
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
        {optimisticData, finallyData},
    );
}

export {saveExitReason, saveResponse, switchToOldDot};
export type {ExitReason};

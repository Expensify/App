import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Save the user's response to the mandatory exit survey in the back-end. The form's isLoading tells the caller when the switch is saved,
 * and the response is kept when the request fails so the user can retry.
 */
function switchToOldDot(exitSurveyResponse: string | undefined) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM,
            value: {isLoading: true, errors: null},
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM | typeof ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM,
            value: {isLoading: false},
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT,
            value: null,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM,
            value: {isLoading: false, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
        },
    ];

    API.write(
        WRITE_COMMANDS.SWITCH_TO_OLD_DOT,
        {
            surveyResponse: exitSurveyResponse,
        },
        {optimisticData, successData, failureData},
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

export {switchToOldDot, resetExitSurveyForm};

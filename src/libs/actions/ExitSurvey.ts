import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {rand64} from '@libs/NumberUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Save the user's response to the mandatory exit survey in the back-end. The outcome is stored under the returned request ID,
 * and the response is kept when the request fails so the user can retry.
 */
function switchToOldDot(exitSurveyResponse: string | undefined): string {
    const requestID = rand64();

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM | typeof ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM,
            value: {switchToOldDotResults: {[requestID]: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED}},
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
            value: {switchToOldDotResults: {[requestID]: CONST.EXIT_SURVEY.SWITCH_RESULT.FAILED}},
        },
    ];

    API.write(
        WRITE_COMMANDS.SWITCH_TO_OLD_DOT,
        {
            surveyResponse: exitSurveyResponse,
        },
        {successData, failureData},
    );

    return requestID;
}

/**
 * Remove the outcome of a handled switch so outcomes don't pile up in storage.
 */
function clearSwitchToOldDotResult(requestID: string) {
    Onyx.merge(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {switchToOldDotResults: {[requestID]: null}});
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

export {switchToOldDot, clearSwitchToOldDotResult, resetExitSurveyForm};

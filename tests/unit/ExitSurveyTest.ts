import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import {switchToOldDot} from '@userActions/ExitSurvey';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** Switches to Classic with the API write observed instead of sent, and returns the request ID and the arguments of the write */
function switchAndGetWrite() {
    const writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
    const requestID = switchToOldDot('Too many clicks');
    expect(writeSpy).toHaveBeenCalledTimes(1);
    const [command, params, onyxData] = writeSpy.mock.calls.at(0) ?? [];
    return {requestID, command, params, onyxData};
}

describe('ExitSurvey', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('stores a saved switch to Classic under its own request ID', () => {
        // Given the API write is observed instead of sent
        // When the user switches to Classic with a survey response
        const {requestID, command, params, onyxData} = switchAndGetWrite();

        // Then the switch is a queued write whose outcome is stored under the request ID, so it can't be mistaken for another switch's outcome
        expect(command).toBe(WRITE_COMMANDS.SWITCH_TO_OLD_DOT);
        expect(params).toEqual({surveyResponse: 'Too many clicks'});
        expect(onyxData?.optimisticData).toBeUndefined();

        // And the draft response is only discarded once the server saved it
        expect(onyxData?.successData).toEqual([
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, value: {switchToOldDotResults: {[requestID]: CONST.EXIT_SURVEY.SWITCH_RESULT.SAVED}}},
            {onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT, value: null},
        ]);
    });

    it('keeps the survey response when the switch to Classic fails', () => {
        // Given the API write is observed instead of sent
        // When the user switches to Classic and the request fails
        const {requestID, onyxData} = switchAndGetWrite();

        // Then only the request's outcome is stored, so the draft stays and the switch can be retried as is
        expect(onyxData?.failureData).toEqual([
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, value: {switchToOldDotResults: {[requestID]: CONST.EXIT_SURVEY.SWITCH_RESULT.FAILED}}},
        ]);
    });

    it('gives each switch its own request ID', () => {
        // Given the API write is observed instead of sent
        jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

        // When the user switches twice, for example from two tabs
        const firstRequestID = switchToOldDot('Too many clicks');
        const secondRequestID = switchToOldDot('Too many clicks');

        // Then the outcomes are stored apart
        expect(firstRequestID).not.toBe(secondRequestID);
    });
});

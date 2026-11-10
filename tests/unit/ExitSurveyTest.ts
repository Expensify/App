import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import {switchToOldDot} from '@userActions/ExitSurvey';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** Switches to Classic with the API write observed instead of sent, and returns the arguments it was called with */
function switchAndGetWrite() {
    const writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
    switchToOldDot('Too many clicks');
    expect(writeSpy).toHaveBeenCalledTimes(1);
    const [command, params, onyxData] = writeSpy.mock.calls.at(0) ?? [];
    return {command, params, onyxData};
}

describe('ExitSurvey', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('reports through the form loading state when the switch to Classic is saved', () => {
        // Given the API write is observed instead of sent
        // When the user switches to Classic with a survey response
        const {command, params, onyxData} = switchAndGetWrite();

        // Then the switch is a queued write whose loading state tells the caller when it is saved
        expect(command).toBe(WRITE_COMMANDS.SWITCH_TO_OLD_DOT);
        expect(params).toEqual({surveyResponse: 'Too many clicks'});
        expect(onyxData?.optimisticData).toEqual([{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, value: {isLoading: true, errors: null}}]);

        // And the draft response is only discarded once the server saved it
        expect(onyxData?.successData).toEqual([
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, value: {isLoading: false}},
            {onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT, value: null},
        ]);
    });

    it('keeps the survey response when the switch to Classic fails', () => {
        // Given the API write is observed instead of sent
        // When the user switches to Classic and the request fails
        const {onyxData} = switchAndGetWrite();

        // Then only the form's loading state and error change, so the draft stays and the switch can be retried as is
        expect(onyxData?.failureData).toEqual([
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, value: {isLoading: false, errors: expect.any(Object) as unknown}},
        ]);
    });
});

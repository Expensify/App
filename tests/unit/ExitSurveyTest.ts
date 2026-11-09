import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import {switchToOldDot} from '@userActions/ExitSurvey';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

describe('ExitSurvey', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('reports when the switch to Classic is saved and keeps the response when it fails', () => {
        // Given the API write is observed instead of sent
        const writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

        // When the user switches to Classic with a survey response
        switchToOldDot('Too many clicks');

        // Then the switch is a queued write whose loading state tells the caller when it is saved
        expect(writeSpy).toHaveBeenCalledTimes(1);
        const [command, params, onyxData] = writeSpy.mock.calls.at(0) ?? [];
        expect(command).toBe(WRITE_COMMANDS.SWITCH_TO_OLD_DOT);
        expect(params).toEqual({surveyResponse: 'Too many clicks'});
        expect(onyxData?.optimisticData).toEqual([{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, value: {isLoading: true, errors: null}}]);

        // And the draft response is only discarded once the server saved it, so a failed switch can be retried as is
        expect(onyxData?.successData).toEqual([
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, value: {isLoading: false}},
            {onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT, value: null},
        ]);
        expect(onyxData?.failureData).toEqual([
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, value: {isLoading: false, errors: expect.any(Object) as unknown}},
        ]);
    });
});

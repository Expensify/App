import {requestRegistrationChallenge} from '@libs/actions/MultifactorAuthentication';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API');

const mockMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);
const VALIDATE_CODE = '123456';

describe('actions/MultifactorAuthentication', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMakeRequestWithSideEffects.mockResolvedValue(undefined);
    });

    it('marks the validate-code form as loading while requesting a registration challenge', async () => {
        await requestRegistrationChallenge(VALIDATE_CODE);

        expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(
            SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_AUTHENTICATION_CHALLENGE,
            {
                challengeType: 'registration',
                validateCode: VALIDATE_CODE,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    {
                        key: ONYXKEYS.ACCOUNT,
                        onyxMethod: Onyx.METHOD.MERGE,
                        value: {
                            isLoading: true,
                            loadingForm: CONST.FORMS.VALIDATE_CODE_FORM,
                        },
                    },
                ]),
                finallyData: expect.arrayContaining([
                    {
                        key: ONYXKEYS.ACCOUNT,
                        onyxMethod: Onyx.METHOD.MERGE,
                        value: {
                            isLoading: false,
                            loadingForm: undefined,
                        },
                    },
                ]),
            }),
        );
    });
});

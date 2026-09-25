import {act} from '@testing-library/react-native';

import {AddWorkEmail} from '@libs/actions/Session';
import HttpUtils from '@libs/HttpUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/AddWorkEmailForm';
import type {Response as OnyxResponse} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

TestHelper.setupGlobalFetchMock();

const workEmail = 'testuser@privateemail.com';

/** Mocks the backend response of the next AddWorkEmail request and restores the original implementation once it settles. */
function mockAddWorkEmailResponse(mockedResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING>, formID?: typeof ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM) {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => Promise.resolve(mockedResponse));
    AddWorkEmail(workEmail, formID);
    return waitForBatchedUpdates().then(() => {
        HttpUtils.xhr = originalXhr;
    });
}

/** The generic backend rejection reported in https://github.com/Expensify/App/issues/98664 */
const forbiddenResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING> = {
    jsonCode: CONST.JSON_CODE.EXP_ERROR,
    message: '403 Forbidden',
    title: '',
};

describe('AddWorkEmail', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await TestHelper.signInWithTestUser();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    describe('when a workspace card flow submits the form', () => {
        it('stops the form loading state and shows the failure inline when the backend rejects the request', async () => {
            await mockAddWorkEmailResponse(forbiddenResponse, ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM);

            const form = await getOnyxValue(ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM);
            expect(form?.isLoading).toBe(false);
            expect(Object.values(form?.errorFields?.[INPUT_IDS.EMAIL] ?? {})).toEqual([TestHelper.translateLocal('common.genericErrorMessage')]);
        });

        it('shows the specific reason inline when the backend returns one', async () => {
            await mockAddWorkEmailResponse(
                {
                    jsonCode: CONST.JSON_CODE.EXP_ERROR,
                    message: `${workEmail} ${CONST.MERGE_ACCOUNT_2FA_ERROR}`,
                    title: '401 work account uses 2FA',
                },
                ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM,
            );

            const form = await getOnyxValue(ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM);
            expect(Object.values(form?.errorFields?.[INPUT_IDS.EMAIL] ?? {})).toEqual([TestHelper.translateLocal('onboarding.workEmail2FAError')]);
        });

        it('does not write onboarding state', async () => {
            await mockAddWorkEmailResponse(forbiddenResponse, ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM);

            expect((await getOnyxValue(ONYXKEYS.NVP_ONBOARDING))?.isMergingAccountBlocked).toBeUndefined();
            expect(await getOnyxValue(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY)).toBeUndefined();
            expect(await getOnyxValue(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM)).toBeUndefined();
        });

        it('stops the form loading state when the request succeeds', async () => {
            await mockAddWorkEmailResponse({jsonCode: 200}, ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM);

            const form = await getOnyxValue(ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM);
            expect(form?.isLoading).toBe(false);
            expect(form?.errorFields).toBeUndefined();
        });
    });

    describe('when onboarding submits the form', () => {
        it('blocks the merge on a generic failure', async () => {
            await mockAddWorkEmailResponse(forbiddenResponse);

            expect((await getOnyxValue(ONYXKEYS.NVP_ONBOARDING))?.isMergingAccountBlocked).toBe(true);
            expect((await getOnyxValue(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM))?.isLoading).toBe(false);
            expect(await getOnyxValue(ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM)).toBeUndefined();
        });

        it('surfaces the specific reason on the onboarding error key', async () => {
            await mockAddWorkEmailResponse({
                jsonCode: CONST.JSON_CODE.EXP_ERROR,
                message: `${workEmail} ${CONST.MERGE_ACCOUNT_2FA_ERROR}`,
                title: '401 work account uses 2FA',
            });

            expect(await getOnyxValue(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY)).toBe('onboarding.workEmail2FAError');
        });
    });
});

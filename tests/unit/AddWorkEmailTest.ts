import {act} from '@testing-library/react-native';

import {AddWorkEmail} from '@libs/actions/Session';
import HttpUtils from '@libs/HttpUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Response as OnyxResponse} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

TestHelper.setupGlobalFetchMock();

const workEmail = 'testuser@privateemail.com';

/** Mocks the backend response of the next AddWorkEmail request and restores the original implementation once it settles. */
function mockAddWorkEmailResponse(mockedResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING>) {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => Promise.resolve(mockedResponse));
    AddWorkEmail(workEmail);
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

    describe('when onboarding submits the form', () => {
        it('blocks the merge on a generic failure', async () => {
            await mockAddWorkEmailResponse(forbiddenResponse);

            expect((await getOnyxValue(ONYXKEYS.NVP_ONBOARDING))?.isMergingAccountBlocked).toBe(true);
            expect((await getOnyxValue(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM))?.isLoading).toBe(false);
        });

        it('surfaces the specific reason on the onboarding error key', async () => {
            await mockAddWorkEmailResponse({
                jsonCode: CONST.JSON_CODE.EXP_ERROR,
                message: `${workEmail} ${CONST.MERGE_ACCOUNT_2FA_ERROR}`,
                title: '401 work account uses 2FA',
            });

            expect(await getOnyxValue(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY)).toBe('onboarding.workEmail2FAError');
        });

        it('does not complete an onboarding task before an existing work account is merged', async () => {
            const taskReportID = '123';
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`, {
                reportID: taskReportID,
                type: CONST.REPORT.TYPE.TASK,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            });
            const taskReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`);
            const originalXhr = HttpUtils.xhr;
            HttpUtils.xhr = jest.fn().mockResolvedValue({jsonCode: 200});

            AddWorkEmail(workEmail, taskReport);
            await waitForBatchedUpdates();

            expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`)).toEqual(
                expect.objectContaining({stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN}),
            );
            expect((await getOnyxValue(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM))?.completedTaskReportActionID).toEqual(expect.any(String));

            HttpUtils.xhr = originalXhr;
        });
    });
});

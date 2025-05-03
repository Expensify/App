/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import * as Report from '@src/libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ESH_EMAIL = 'eshgupta1217@gmail.com';
const ESH_ACCOUNT_ID = 1;

describe('actions/Report', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('completeOnboarding', () => {
        it('should set "isOptimisticAction" to false/null for all actions in admins report after completing onboarding setup', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const adminsChatReportID = '7957055873634067';
            const onboardingPolicyID = 'A70D00C752416807';

            Report.completeOnboarding({
                engagementChoice: 'newDotManageTeam',
                onboardingMessage: CONST.ONBOARDING_MESSAGES.newDotManageTeam,
                adminsChatReportID,
                onboardingPolicyID,
                companySize: '1-10',
                userReportedIntegration: null,
            });

            await waitForBatchedUpdates();

            const reportActions: OnyxEntry<ReportActions> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
                    callback: (id) => {
                        Onyx.disconnect(connection);
                        resolve(id);
                    },
                });
            });
            expect(reportActions).not.toBeNull();
            expect(reportActions).not.toBeUndefined();
            Object.values(reportActions ?? {}).forEach((action) => {
                expect(action.isOptimisticAction).toBeFalsy();
            });
        });
    });
});

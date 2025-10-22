import Onyx from 'react-native-onyx';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {startTestDrive} from '@libs/actions/Tour';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnboardingPurpose, Report, ReportAction} from '@src/types/onyx';
import type {ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

OnyxUpdateManager();
describe('actions/Tour', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        SequentialQueue.resetQueue();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('startTestDrive', () => {
        describe('migrated users', () => {
            it('should show the Test Drive demo if user has been nudged to migrate', async () => {
                startTestDrive(undefined, false, true, false, undefined, undefined, false);
                await waitForBatchedUpdates();

                expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TEST_DRIVE_DEMO_ROOT);
            });

            it("should show the Test Drive demo if user doesn't have the nudge flag but is member of a paid policy", async () => {
                startTestDrive(undefined, false, false, true, undefined, undefined, false);
                await waitForBatchedUpdates();

                expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TEST_DRIVE_DEMO_ROOT);
            });
        });

        describe('NewDot users', () => {
            const onboardingChoices = Object.values(CONST.ONBOARDING_CHOICES);
            const onboardingDemoChoices: OnboardingPurpose[] = [CONST.ONBOARDING_CHOICES.MANAGE_TEAM, CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER, CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE];
            const accountID = 2;
            const conciergeChatReport: Report = LHNTestUtils.getFakeReport([accountID, CONST.ACCOUNT_ID.CONCIERGE]);
            const testDriveTaskReport: Report = {...LHNTestUtils.getFakeReport(), ownerAccountID: accountID};

            const setTestDriveTaskData = async () => {
                const testDriveTaskAction: ReportAction = {
                    ...LHNTestUtils.getFakeReportAction(),
                    childType: CONST.REPORT.TYPE.TASK,
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    childReportName: Parser.replace(translateLocal('onboarding.testDrive.name', {testDriveURL: `${CONST.STAGING_NEW_EXPENSIFY_URL}/${ROUTES.TEST_DRIVE_DEMO_ROOT}`})),
                    childReportID: testDriveTaskReport.reportID,
                };

                const reportActionsCollectionDataSet: ReportActionsCollectionDataSet = {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${conciergeChatReport.reportID}`]: {
                        [testDriveTaskAction.reportActionID]: testDriveTaskAction,
                    },
                };

                await Onyx.multiSet({
                    ...reportActionsCollectionDataSet,
                    [ONYXKEYS.SESSION]: {
                        accountID,
                    },
                });
            };

            it.each(onboardingChoices.filter((choice) => onboardingDemoChoices.includes(choice)))('should show the Test Drive demo if user has "%s" onboarding choice', async (choice) => {
                await setTestDriveTaskData();

                startTestDrive({choice}, false, false, false, testDriveTaskReport, conciergeChatReport, false);
                await waitForBatchedUpdates();

                expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TEST_DRIVE_DEMO_ROOT);
            });

            it.each(onboardingChoices.filter((choice) => !onboardingDemoChoices.includes(choice)))('should show the Test Drive modal if user has "%s" onboarding choice', async (choice) => {
                startTestDrive({choice}, false, false, false, undefined, undefined, false);
                await waitForBatchedUpdates();

                expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TEST_DRIVE_MODAL_ROOT.route);
            });

            it('should show the Test Drive demo if user is an invited employee', async () => {
                await setTestDriveTaskData();

                startTestDrive(
                    {choice: CONST.ONBOARDING_CHOICES.SUBMIT, inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE},
                    false,
                    false,
                    false,
                    testDriveTaskReport,
                    conciergeChatReport,
                    false,
                );
                await waitForBatchedUpdates();

                expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TEST_DRIVE_DEMO_ROOT);
            });

            it('should show the Test Drive demo if user is member of a paid policy', async () => {
                startTestDrive({choice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND}, false, false, true, testDriveTaskReport, conciergeChatReport, false);
                await waitForBatchedUpdates();

                expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TEST_DRIVE_DEMO_ROOT);
            });
        });
    });
});

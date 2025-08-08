import Onyx from 'react-native-onyx';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {getFinishOnboardingTaskOnyxData} from '@libs/actions/Task';
import {startTestDrive} from '@libs/actions/Tour';
import {translateLocal} from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnboardingPurpose, Report, ReportAction} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
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
                startTestDrive(undefined, false, true);
                await waitForBatchedUpdates();

                expect(Navigation.navigate).toBeCalledWith(ROUTES.TEST_DRIVE_DEMO_ROOT);
            });
        });

        describe('NewDot users', () => {
            const onboardingChoices = Object.values(CONST.ONBOARDING_CHOICES);
            const onboardingDemoChoices: OnboardingPurpose[] = [CONST.ONBOARDING_CHOICES.MANAGE_TEAM, CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER, CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE];

            const setTestDriveTaskData = async () => {
                const accountID = 2;
                const conciergeChatReport: Report = LHNTestUtils.getFakeReport([accountID, CONST.ACCOUNT_ID.CONCIERGE]);
                const testDriveTaskReport: Report = {...LHNTestUtils.getFakeReport(), ownerAccountID: accountID};
                const testDriveTaskAction: ReportAction = {
                    ...LHNTestUtils.getFakeReportAction(),
                    childType: CONST.REPORT.TYPE.TASK,
                    childReportName: Parser.replace(translateLocal('onboarding.testDrive.name', {testDriveURL: `${CONST.STAGING_NEW_EXPENSIFY_URL}/${ROUTES.TEST_DRIVE_DEMO_ROOT}`})),
                    childReportID: testDriveTaskReport.reportID,
                };

                const reportCollectionDataSet: ReportCollectionDataSet = {
                    [`${ONYXKEYS.COLLECTION.REPORT}${testDriveTaskReport.reportID}`]: testDriveTaskReport,
                    [`${ONYXKEYS.COLLECTION.REPORT}${conciergeChatReport.reportID}`]: conciergeChatReport,
                };

                const reportActionsCollectionDataSet: ReportActionsCollectionDataSet = {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${conciergeChatReport.reportID}`]: {
                        [testDriveTaskAction.reportActionID]: testDriveTaskAction,
                    },
                };

                await Onyx.multiSet({
                    ...reportCollectionDataSet,
                    ...reportActionsCollectionDataSet,
                    [ONYXKEYS.NVP_INTRO_SELECTED]: {
                        viewTour: testDriveTaskReport.reportID,
                    },
                    [ONYXKEYS.SESSION]: {
                        accountID,
                    },
                });
            };

            it.each(onboardingChoices.filter((choice) => onboardingDemoChoices.includes(choice)))('should show the Test Drive demo if user has "%s" onboarding choice', async (choice) => {
                await setTestDriveTaskData();

                startTestDrive({choice}, false, false);
                await waitForBatchedUpdates();

                expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TEST_DRIVE_DEMO_ROOT);
                // An empty object means the task was completed.
                expect(Object.values(getFinishOnboardingTaskOnyxData(CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR)).length).toBe(0);
            });

            it.each(onboardingChoices.filter((choice) => !onboardingDemoChoices.includes(choice)))('should show the Test Drive modal if user has "%s" onboarding choice', async (choice) => {
                startTestDrive({choice}, false, false);
                await waitForBatchedUpdates();

                expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TEST_DRIVE_MODAL_ROOT.route);
            });

            it('should show the Test Drive demo if user is an invited employee', async () => {
                await setTestDriveTaskData();

                startTestDrive({choice: CONST.ONBOARDING_CHOICES.SUBMIT, inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE}, false, false);
                await waitForBatchedUpdates();

                expect(Navigation.navigate).toBeCalledWith(ROUTES.TEST_DRIVE_DEMO_ROOT);
                // An empty object means the task was completed.
                expect(Object.values(getFinishOnboardingTaskOnyxData(CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR)).length).toBe(0);
            });
        });
    });
});

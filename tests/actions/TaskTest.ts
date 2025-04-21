import Onyx from 'react-native-onyx';
import {completeTestDriveTask} from '@libs/actions/Task';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ReportUtils from '@libs/ReportUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

jest.mock('@react-native-community/geolocation', () => ({
    setRNConfiguration: jest.fn(),
}));

describe('actions/Task', () => {
    const accountID = 2;
    const conciergeChatReport: Report = LHNTestUtils.getFakeReport([accountID, CONST.ACCOUNT_ID.CONCIERGE]);
    const testDriveTaskReport: Report = LHNTestUtils.getFakeReport();
    const testDriveTaskAction: ReportAction = {
        ...LHNTestUtils.getFakeReportAction(),
        childType: CONST.REPORT.TYPE.TASK,
        childReportName: CONST.TEST_DRIVE.ONBOARDING_TASK_NAME,
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

    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.multiSet({
            ...reportCollectionDataSet,
            ...reportActionsCollectionDataSet,
        });
        await waitForBatchedUpdates();
    });

    describe('completeTestDriveTask', () => {
        it('Uses concierge room', () => {
            const getChatUsedForOnboardingSpy = jest.spyOn(ReportUtils, 'getChatUsedForOnboarding');

            completeTestDriveTask();

            expect(getChatUsedForOnboardingSpy).toHaveReturnedWith(conciergeChatReport);
        });
        it('Completes test drive task', () => {
            const writeSpy = jest.spyOn(API, 'write');

            completeTestDriveTask();

            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.COMPLETE_TASK, expect.anything(), expect.anything());
        });
    });
});

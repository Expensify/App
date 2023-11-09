import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportAction, {ReportActions} from '@src/types/onyx/ReportAction';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as ReportTestUtils from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.setTimeout(60000);

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

// Clear out Onyx after each test so that each test starts with a clean slate
afterEach(() => {
    Onyx.clear();
});

const getMockedReportActionsMap = (reportsLength = 10, actionsPerReportLength = 100) => {
    const mockReportActions = Array.from({length: actionsPerReportLength}, (v, i) => {
        const reportActionKey = i + 1;
        const email = `actor+${reportActionKey}@mail.com`;
        const reportAction = LHNTestUtils.getFakeReportAction(email);

        return {[reportActionKey]: reportAction};
    });

    const reportKeysMap = Array.from({length: reportsLength}, (v, i) => {
        const key = i + 1;

        return {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${key}`]: Object.assign({}, ...mockReportActions)};
    });

    return Object.assign({}, ...reportKeysMap) as Partial<ReportAction>;
};

const mockedReportActionsMap = getMockedReportActionsMap(2, 10000);
const reportId = '1';

/**
 * This function will be executed 20 times and the average time will be used on the comparison.
 * It will fail based on the CI configuration around Reassure:
 * @see /.github/workflows/reassurePerformanceTests.yml
 *
 * Max deviation on the duration is set to 20% at the time of writing.
 *
 * More on the measureFunction API:
 * @see https://callstack.github.io/reassure/docs/api#measurefunction-function
 */
test('getLastVisibleAction on 10k reportActions', async () => {
    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });

    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getLastVisibleAction(reportId), {runs: 20});
});

test('getLastVisibleAction on 10k reportActions with actionsToMerge', async () => {
    const parentReportActionId = '1';
    const fakeParentAction = ReportTestUtils.getMockedReportActionsMap()[parentReportActionId];
    const actionsToMerge = {
        [parentReportActionId]: {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            previousMessage: fakeParentAction.message,
            message: [
                {
                    translationKey: '',
                    type: 'COMMENT',
                    html: '',
                    text: '',
                    isEdited: true,
                    isDeletedParentAction: true,
                },
            ],
            errors: null,
            linkMetaData: [],
        },
    } as unknown as ReportActions;

    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getLastVisibleAction(reportId, actionsToMerge), {runs: 20});
});

test('getSortedReportActions on 10k ReportActions', async () => {
    const reportActionsArray = ReportTestUtils.getMockedSortedReportActions() as unknown as ReportAction[];

    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getSortedReportActions(reportActionsArray), {runs: 20});
});

test('getMostRecentIOURequestActionID on 10k ReportActions', async () => {
    const reportActionsArray = (length = 100) => Array.from({length}, (__, i) => ReportTestUtils.getFakeReportAction(i, 'IOU')) as unknown as ReportAction[];
    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getMostRecentIOURequestActionID(reportActionsArray()), {runs: 20});
});

test('getLastVisibleMessage on 10k ReportActions', async () => {
    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getLastVisibleMessage(reportId), {runs: 20});
});

test('getLastVisibleMessage on 10k ReportActions with actionsToMerge', async () => {
    const parentReportActionId = '1';
    const fakeParentAction = ReportTestUtils.getMockedReportActionsMap()[parentReportActionId];
    const actionsToMerge = {
        [parentReportActionId]: {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            previousMessage: fakeParentAction.message,
            message: [
                {
                    translationKey: '',
                    type: 'COMMENT',
                    html: '',
                    text: '',
                    isEdited: true,
                    isDeletedParentAction: true,
                },
            ],
            errors: null,
            linkMetaData: [],
        },
    } as unknown as ReportActions;

    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getLastVisibleMessage(reportId, actionsToMerge), {runs: 20});
});

test('getSortedReportActionsForDisplay on 10k ReportActions', async () => {
    const reportActions = ReportTestUtils.getMockedReportActionsMap();
    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getSortedReportActionsForDisplay(reportActions), {runs: 20});
});

test('getLastClosedReportAction on 10k ReportActions', async () => {
    const reportActions = ReportTestUtils.getMockedReportActionsMap();
    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getLastClosedReportAction(reportActions), {runs: 20});
});

test('getMostRecentReportActionLastModified', async () => {
    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getMostRecentReportActionLastModified(), {runs: 20});
});


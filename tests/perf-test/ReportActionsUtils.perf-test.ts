import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportAction, {ReportActions} from '@src/types/onyx/ReportAction';
import createCollection from '../utils/collections/createCollection';
import createRandomReportAction from '../utils/collections/reportActions';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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
        const reportAction = createRandomReportAction(reportActionKey);

        return {[reportActionKey]: reportAction};
    });

    const reportKeysMap = Array.from({length: reportsLength}, (v, i) => {
        const key = i + 1;

        return {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${key}`]: Object.assign({}, ...mockReportActions)};
    });

    return Object.assign({}, ...reportKeysMap) as Partial<ReportAction>;
};

const mockedReportActionsMap = getMockedReportActionsMap(2, 10000);

const reportActions = createCollection<ReportAction>(
    (item) => `${item.reportActionID}`,
    (index) => createRandomReportAction(index),
);

const reportId = '1';

const runs = CONST.PERFORMANCE_TESTS.RUNS;

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
    await measureFunction(() => ReportActionsUtils.getLastVisibleAction(reportId), {runs});
});

test('getLastVisibleAction on 10k reportActions with actionsToMerge', async () => {
    const parentReportActionId = '1';
    const fakeParentAction = reportActions[parentReportActionId];
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
    await measureFunction(() => ReportActionsUtils.getLastVisibleAction(reportId, actionsToMerge), {runs});
});

test('getMostRecentIOURequestActionID on 10k ReportActions', async () => {
    const reportActionsArray = ReportActionsUtils.getSortedReportActionsForDisplay(reportActions);
    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getMostRecentIOURequestActionID(reportActionsArray), {runs});
});

test('getLastVisibleMessage on 10k ReportActions', async () => {
    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getLastVisibleMessage(reportId), {runs});
});

test('getLastVisibleMessage on 10k ReportActions with actionsToMerge', async () => {
    const parentReportActionId = '1';
    const fakeParentAction = reportActions[parentReportActionId];
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
    await measureFunction(() => ReportActionsUtils.getLastVisibleMessage(reportId, actionsToMerge), {runs});
});

test('getSortedReportActionsForDisplay on 10k ReportActions', async () => {
    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getSortedReportActionsForDisplay(reportActions), {runs});
});

test('getLastClosedReportAction on 10k ReportActions', async () => {
    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getLastClosedReportAction(reportActions), {runs});
});

test('getMostRecentReportActionLastModified', async () => {
    await Onyx.multiSet({
        ...mockedReportActionsMap,
    });
    await waitForBatchedUpdates();
    await measureFunction(() => ReportActionsUtils.getMostRecentReportActionLastModified(), {runs});
});

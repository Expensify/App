import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import type ReportAction from '@src/types/onyx/ReportAction';
import createCollection from '../utils/collections/createCollection';
import createRandomReportAction from '../utils/collections/reportActions';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const getMockedReportActionsMap = (reportsLength = 10, actionsPerReportLength = 100) => {
    const mockReportActions = Array.from({length: actionsPerReportLength}, (v, i) => {
        const reportActionKey = i + 1;
        const reportAction = createRandomReportAction(reportActionKey);

        return {[reportActionKey]: reportAction};
    });

    const reportKeysMap = Array.from({length: reportsLength}, (v, i) => {
        const key = i + 1;

        return {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${key}`]: Object.assign({}, ...mockReportActions) as Partial<ReportAction>};
    });

    return Object.assign({}, ...reportKeysMap) as Partial<ReportAction>;
};

const mockedReportActionsMap: Partial<ReportAction> = getMockedReportActionsMap(2, 10000);

const reportActions = createCollection<ReportAction>(
    (item) => `${item.reportActionID}`,
    (index) => createRandomReportAction(index),
);

const reportId = '1';

describe('ReportActionsUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });

        Onyx.multiSet({
            ...mockedReportActionsMap,
        });
    });

    afterAll(() => {
        Onyx.clear();
    });

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
    test('[ReportActionsUtils] getLastVisibleAction on 10k reportActions', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => ReportActionsUtils.getLastVisibleAction(reportId));
    });

    test('[ReportActionsUtils] getLastVisibleAction on 10k reportActions with actionsToMerge', async () => {
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

        await waitForBatchedUpdates();
        await measureFunction(() => ReportActionsUtils.getLastVisibleAction(reportId, actionsToMerge));
    });

    test('[ReportActionsUtils] getMostRecentIOURequestActionID on 10k ReportActions', async () => {
        const reportActionsArray = ReportActionsUtils.getSortedReportActionsForDisplay(reportActions);

        await waitForBatchedUpdates();
        await measureFunction(() => ReportActionsUtils.getMostRecentIOURequestActionID(reportActionsArray));
    });

    test('[ReportActionsUtils] getLastVisibleMessage on 10k ReportActions', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => ReportActionsUtils.getLastVisibleMessage(reportId));
    });

    test('[ReportActionsUtils] getLastVisibleMessage on 10k ReportActions with actionsToMerge', async () => {
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

        await waitForBatchedUpdates();
        await measureFunction(() => ReportActionsUtils.getLastVisibleMessage(reportId, actionsToMerge));
    });

    test('[ReportActionsUtils] getSortedReportActionsForDisplay on 10k ReportActions', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => ReportActionsUtils.getSortedReportActionsForDisplay(reportActions));
    });

    test('[ReportActionsUtils] getLastClosedReportAction on 10k ReportActions', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => ReportActionsUtils.getLastClosedReportAction(reportActions));
    });

    test('[ReportActionsUtils] getMostRecentReportActionLastModified', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => ReportActionsUtils.getMostRecentReportActionLastModified());
    });
});

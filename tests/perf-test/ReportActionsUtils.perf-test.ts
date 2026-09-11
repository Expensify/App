import {getLastVisibleAction, getLastVisibleMessage, getSortedReportActionsForDisplay} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions, ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import type ReportAction from '@src/types/onyx/ReportAction';

import {getLastClosedReportAction} from '@selectors/ReportAction';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';

import createCollection from '../utils/collections/createCollection';
import createRandomReportAction from '../utils/collections/reportActions';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type ActionsToMerge = NonNullable<Parameters<typeof getLastVisibleAction>[2]>;

const getMockedReportActionsMap = (reportsLength = 10, actionsPerReportLength = 100): ReportActionsCollectionDataSet => {
    const mockReportActions: ReportActions = {};
    for (let actionIndex = 1; actionIndex <= actionsPerReportLength; actionIndex++) {
        mockReportActions[actionIndex] = createRandomReportAction(actionIndex);
    }

    const reportActionsMap: ReportActionsCollectionDataSet = {};
    for (let reportIndex = 1; reportIndex <= reportsLength; reportIndex++) {
        const reportActions: ReportActions = {};
        for (const [actionKey, reportAction] of Object.entries(mockReportActions)) {
            reportActions[actionKey] = reportAction;
        }
        reportActionsMap[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportIndex}`] = reportActions;
    }

    return reportActionsMap;
};

const mockedReportActionsMap: ReportActionsCollectionDataSet = getMockedReportActionsMap(2, 10000);

const reportActions = createCollection<ReportAction>(
    (item) => `${item.reportActionID}`,
    (index) => createRandomReportAction(index),
);

const reportId = '1';

describe('ReportActionsUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });

        Onyx.multiSet(mockedReportActionsMap);
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
        await measureFunction(() => getLastVisibleAction(reportId));
    });

    test('[ReportActionsUtils] getLastVisibleAction on 10k reportActions with actionsToMerge', async () => {
        const parentReportActionId = '1';
        const fakeParentAction = reportActions[parentReportActionId];
        const actionsToMerge: ActionsToMerge = {
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
                linkMetadata: [],
            },
        };

        await waitForBatchedUpdates();
        await measureFunction(() => getLastVisibleAction(reportId, true, actionsToMerge));
    });

    test('[ReportActionsUtils] getLastVisibleMessage on 10k ReportActions', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => getLastVisibleMessage(reportId));
    });

    test('[ReportActionsUtils] getLastVisibleMessage on 10k ReportActions with actionsToMerge', async () => {
        const parentReportActionId = '1';
        const fakeParentAction = reportActions[parentReportActionId];
        const actionsToMerge: ActionsToMerge = {
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
                linkMetadata: [],
            },
        };

        await waitForBatchedUpdates();
        await measureFunction(() => getLastVisibleMessage(reportId, true, actionsToMerge));
    });

    test('[ReportActionsUtils] getSortedReportActionsForDisplay on 10k ReportActions', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => getSortedReportActionsForDisplay(reportActions, true));
    });

    test('[ReportActionsUtils] getLastClosedReportAction on 10k ReportActions', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => getLastClosedReportAction(reportActions));
    });
});

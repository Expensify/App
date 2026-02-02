import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import {getSortedReportActions} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import createRandomReportAction from '../utils/collections/reportActions';

const ACTIONS_COUNT = 100;

describe('ReportActionsUtils Cache Performance', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterAll(() => {
        Onyx.clear();
    });

    test('[ReportActionsUtils] getSortedReportActions cache hit performance', async () => {
        const reportActions = createCollection<ReportAction>(
            (item) => `${item.reportActionID}`,
            (index) => createRandomReportAction(index),
            ACTIONS_COUNT,
        );

        const actionsArray = Object.values(reportActions);

        getSortedReportActions(actionsArray, true);

        await measureFunction(() => getSortedReportActions(actionsArray, true), {runs: 20});
    });

    test('[ReportActionsUtils] getSortedReportActions with different array references', async () => {
        const reportActions = createCollection<ReportAction>(
            (item) => `${item.reportActionID}`,
            (index) => createRandomReportAction(index),
            ACTIONS_COUNT,
        );

        const actionsArray = Object.values(reportActions);

        getSortedReportActions(actionsArray, true);

        const newArrayRef = [...actionsArray];

        await measureFunction(() => getSortedReportActions(newArrayRef, true), {runs: 20});
    });
});

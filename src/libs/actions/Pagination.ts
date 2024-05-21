import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type ReportActionsPages from '@src/types/onyx/ReportActionsPages';

let reportActionsPages: OnyxCollection<ReportActionsPages> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
    waitForCollectionCallback: true,
    callback: (pages) => (reportActionsPages = pages),
});

function trackReportActions(reportID: string, pageStart: number, pageEnd: number) {}

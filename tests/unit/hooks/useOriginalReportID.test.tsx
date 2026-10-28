import {renderHook, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useOriginalReportID from '@hooks/useOriginalReportID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, Transaction} from '@src/types/onyx';

import type {ReactNode} from 'react';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';

describe('useOriginalReportID', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();
    });

    it('should return the reportID given a DEW routed action', async () => {
        // Given a report actions that contain DEW SUBMITTED action
        const reportID = '1';
        const dewSubmittedAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED> = {
            actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
            created: '',
            reportActionID: '1',
            originalMessage: {
                workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
                to: 'example@gmail.com',
                amount: 1,
                currency: CONST.CURRENCY.USD,
            },
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            [dewSubmittedAction.reportActionID]: dewSubmittedAction,
        });

        const wrapper = ({children}: {children: ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

        // When getting the original reportID of a DEW routed action that is derived from the DEW SUBMITTED action
        const dewRoutedAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED> = {
            actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED,
            created: '',
            reportActionID: '1DEW',
        };
        const {result} = renderHook(() => useOriginalReportID(reportID, dewRoutedAction), {wrapper});

        // Then it should successfully return the reportID of the action
        expect(result.current).toBe(reportID);
    });

    it('should return the transaction thread reportID for an action merged from a single-expense report thread', async () => {
        // Given an expense report with one expense whose thread holds an action that is not in the expense report itself
        const reportID = '1';
        const chatReportID = '2';
        const transactionThreadReportID = '3';
        const transactionID = 'txn-1';
        const iouAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            created: '',
            reportActionID: 'iou-1',
            childReportID: transactionThreadReportID,
            message: [{type: 'TEXT', html: 'expense', text: 'expense'}],
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: transactionID,
                amount: 100,
                currency: CONST.CURRENCY.USD,
            },
        };
        const threadComment: ReportAction = {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            created: '',
            reportActionID: 'thread-comment-1',
        };
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {reportID, type: CONST.REPORT.TYPE.EXPENSE, chatReportID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {reportID: chatReportID, type: CONST.REPORT.TYPE.CHAT});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[iouAction.reportActionID]: iouAction});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`, {[threadComment.reportActionID]: threadComment});
        await Onyx.set(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, {
            [reportID]: {transactions: {[transactionID]: createMock<Transaction>({transactionID, reportID})}, violations: {}},
        });

        const wrapper = ({children}: {children: ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

        // When getting the original reportID of the thread action while viewing the expense report
        const {result} = renderHook(() => useOriginalReportID(reportID, threadComment), {wrapper});

        // Then it should return the transaction thread reportID, because that's where the action lives
        await waitFor(() => expect(result.current).toBe(transactionThreadReportID));
    });

    it('should return the parentReportID for the parent action of a thread report', async () => {
        // Given a thread report whose parent action lives in its parent report
        const reportID = '1';
        const parentReportID = '2';
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {reportID, parentReportID});

        const wrapper = ({children}: {children: ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

        // When getting the original reportID of the action that created the thread
        const parentAction: Pick<ReportAction, 'reportActionID' | 'childReportID'> = {reportActionID: 'parent-1', childReportID: reportID};
        const {result} = renderHook(() => useOriginalReportID(reportID, parentAction), {wrapper});

        // Then it should return the parentReportID, because the thread's parent action belongs to the parent report
        await waitFor(() => expect(result.current).toBe(parentReportID));
    });
});

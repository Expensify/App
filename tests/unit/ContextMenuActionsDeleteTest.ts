import type * as ContextMenuActionsModule from '@pages/inbox/report/ContextMenu/ContextMenuActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';

jest.mock(
    'expo-web-browser',
    () => ({
        openAuthSessionAsync: jest.fn(),
    }),
    {virtual: true},
);

jest.mock('@components/Reactions/MiniQuickEmojiReactions', () => 'MiniQuickEmojiReactions');
jest.mock('@components/Reactions/QuickEmojiReactions', () => 'QuickEmojiReactions');

const mockShowDeleteModal = jest.fn();

jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => ({
    hideContextMenu: jest.fn(),
    showDeleteModal: (...args: unknown[]) => {
        mockShowDeleteModal(...args);
    },
}));

const {default: ContextMenuActions} = jest.requireActual<typeof ContextMenuActionsModule>('@pages/inbox/report/ContextMenu/ContextMenuActions');

const deleteAction = ContextMenuActions.find((action) => 'sentryLabel' in action && action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.DELETE);
if (!deleteAction || !('onPress' in deleteAction)) {
    throw new Error('Delete context menu action was not found');
}

type DeleteActionPayload = Parameters<typeof deleteAction.onPress>[1];
type DeleteActionVisibilityPayload = Parameters<typeof deleteAction.shouldShow>[0];

describe('ContextMenuActions delete action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deletes the report preview when the report author cannot delete its restricted card expense', () => {
        // Given a report preview whose only expense belongs to the current user but has restricted card liability
        const currentUserAccountID = 1;
        const parentReportID = '10';
        const expenseReportID = '11';
        const reportPreviewAction: ReportAction = {
            ...createRandomReportAction(1),
            actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            childReportID: expenseReportID,
        };
        const moneyRequestAction: ReportAction = {
            ...createRandomReportAction(2),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: currentUserAccountID,
            reportID: expenseReportID,
        };
        const iouTransaction = {
            ...createRandomTransaction(3),
            managedCard: true,
            comment: {liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT},
        };
        const payload = createMock<DeleteActionPayload>({
            reportID: parentReportID,
            reportAction: reportPreviewAction,
            moneyRequestAction,
            currentUserAccountID,
            iouTransaction,
        });

        // When the user selects Delete from the report preview context menu
        deleteAction.onPress(false, payload);

        // Then the report preview is deleted so the expense becomes unreported instead of being deleted
        expect(mockShowDeleteModal).toHaveBeenCalledWith(parentReportID, reportPreviewAction);
    });

    it('hides Delete from a member who owns an Expensify Card expense', async () => {
        // Given a member viewing the report preview for their own Expensify Card expense
        const currentUserAccountID = 1;
        const parentReportID = '20';
        const expenseReportID = '21';
        const transactionID = '22';
        const expenseReport: Report = {
            reportID: expenseReportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: currentUserAccountID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };
        const reportPreviewAction: ReportAction = {
            ...createRandomReportAction(20),
            actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            childReportID: expenseReportID,
        };
        const moneyRequestAction: ReportAction = {
            ...createRandomReportAction(21),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: currentUserAccountID,
            reportID: expenseReportID,
            originalMessage: {
                IOUTransactionID: transactionID,
                amount: 100,
                currency: CONST.CURRENCY.USD,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            },
        };
        const iouTransaction = {
            ...createRandomTransaction(Number(transactionID)),
            transactionID,
            reportID: expenseReportID,
            managedCard: false,
            bank: CONST.EXPENSIFY_CARD.BANK,
            comment: {liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT},
        };
        const payload = createMock<DeleteActionVisibilityPayload>({
            type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            reportID: parentReportID,
            reportAction: reportPreviewAction,
            moneyRequestAction,
            currentUserAccountID,
            iouTransaction,
            transactions: {[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: iouTransaction},
            childReportActions: {[moneyRequestAction.reportActionID]: moneyRequestAction},
            isArchivedRoom: false,
            isChronosReport: false,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport);

        // When the context menu determines which actions to show
        const shouldShowDelete = deleteAction.shouldShow(payload);

        // Then Delete is hidden because Auth does not allow a member to delete an Expensify Card expense or its report
        expect(shouldShowDelete).toBe(false);
    });
});

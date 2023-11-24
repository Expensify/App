import {Parser as HtmlParser} from 'htmlparser2';
import {OnyxEntry} from 'react-native-onyx';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import {ReportAction, ReportActions, Transaction} from '@src/types/onyx';

type Attachment = {
    reportActionID?: string;
    source: string;
    isAuthTokenRequired: boolean;
    file: {name: string};
    isReceipt: boolean;
    hasBeenFlagged?: boolean;
    transactionID?: string;
};

function extractAttachmentsFromReport(parentReportAction: OnyxEntry<ReportAction>, reportActions: OnyxEntry<ReportActions>, transaction: OnyxEntry<Transaction>) {
    const actions = [parentReportAction, ...ReportActionsUtils.getSortedReportActions(Object.values(reportActions ?? {}))];
    const attachments: Attachment[] = [];

    const htmlParser = new HtmlParser({
        onopentag: (name, attribs) => {
            if (name !== 'img' || !attribs.src) {
                return;
            }

            const expensifySource = attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE];

            // By iterating actions in chronological order and prepending each attachment
            // we ensure correct order of attachments even across actions with multiple attachments.
            attachments.unshift({
                reportActionID: attribs['data-id'],
                source: tryResolveUrlFromApiRoot(expensifySource || attribs.src),
                isAuthTokenRequired: Boolean(expensifySource),
                file: {name: attribs[CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE]},
                isReceipt: false,
                hasBeenFlagged: attribs['data-flagged'] === 'true',
            });
        },
    });

    actions.forEach((action, key) => {
        if (!ReportActionsUtils.shouldReportActionBeVisible(action, key)) {
            return;
        }

        // We're handling receipts differently here because receipt images are not
        // part of the report action message, the images are constructed client-side
        if (ReportActionsUtils.isMoneyRequestAction(action) && action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
            const transactionID = action?.originalMessage?.IOUTransactionID;
            if (!transactionID) {
                return;
            }

            if (TransactionUtils.hasReceipt(transaction) && transaction) {
                const {image} = ReceiptUtils.getThumbnailAndImageURIs(transaction);
                const isLocalFile = typeof image === 'string' && CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => image.startsWith(prefix));
                attachments.unshift({
                    source: tryResolveUrlFromApiRoot(image as string),
                    isAuthTokenRequired: !isLocalFile,
                    file: {name: transaction.filename ?? ''},
                    isReceipt: true,
                    transactionID,
                });
                return;
            }
        }

        const decision = action?.message?.[0].moderationDecision?.decision ?? '';
        const hasBeenFlagged = decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_HIDE || decision === CONST.MODERATION.MODERATOR_DECISION_HIDDEN;
        const html = (action?.message?.[0].html ?? '').replace('/>', `data-flagged="${hasBeenFlagged}" data-id="${action?.reportActionID}"/>`);
        htmlParser.write(html);
    });
    htmlParser.end();

    return attachments.reverse();
}

export default extractAttachmentsFromReport;

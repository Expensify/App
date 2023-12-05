import {Parser as HtmlParser} from 'htmlparser2';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';

/**
 * Constructs the initial component state from report actions
 * @param {Object} parentReportAction
 * @param {Object} reportActions
 * @param {Object} transaction
 * @returns {Array}
 */
function extractAttachmentsFromReport(parentReportAction, reportActions, transaction) {
    const actions = [parentReportAction, ...ReportActionsUtils.getSortedReportActions(_.values(reportActions))];
    const attachments = [];

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

    _.forEach(actions, (action, key) => {
        if (!ReportActionsUtils.shouldReportActionBeVisible(action, key)) {
            return;
        }

        // We're handling receipts differently here because receipt images are not
        // part of the report action message, the images are constructed client-side
        if (ReportActionsUtils.isMoneyRequestAction(action)) {
            const transactionID = lodashGet(action, ['originalMessage', 'IOUTransactionID']);
            if (!transactionID) {
                return;
            }

            if (TransactionUtils.hasReceipt(transaction)) {
                const {image} = ReceiptUtils.getThumbnailAndImageURIs(transaction);
                const isLocalFile = typeof image === 'string' && _.some(CONST.ATTACHMENT_LOCAL_URL_PREFIX, (prefix) => image.startsWith(prefix));
                attachments.unshift({
                    source: tryResolveUrlFromApiRoot(image),
                    isAuthTokenRequired: !isLocalFile,
                    file: {name: transaction.filename},
                    isReceipt: true,
                    transactionID,
                });
                return;
            }
        }

        const decision = _.get(action, ['message', 0, 'moderationDecision', 'decision'], '');
        const hasBeenFlagged = decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_HIDE || decision === CONST.MODERATION.MODERATOR_DECISION_HIDDEN;
        const html = _.get(action, ['message', 0, 'html'], '').replace('/>', `data-flagged="${hasBeenFlagged}" data-id="${action.reportActionID}"/>`);
        htmlParser.write(html);
    });
    htmlParser.end();

    return attachments.reverse();
}

export default extractAttachmentsFromReport;

import {Parser as HtmlParser} from 'htmlparser2';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import * as TransactionUtils from '../../../libs/TransactionUtils';
import * as ReceiptUtils from '../../../libs/ReceiptUtils';
import CONST from '../../../CONST';
import tryResolveUrlFromApiRoot from '../../../libs/tryResolveUrlFromApiRoot';

/**
 * Constructs the initial component state from report actions
 * @param {Object} report
 * @param {Array} reportActions
 * @returns {Array}
 */
function extractAttachmentsFromReport(report, reportActions) {
    const actions = [ReportActionsUtils.getParentReportAction(report), ...ReportActionsUtils.getSortedReportActions(_.values(reportActions))];
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
                source: tryResolveUrlFromApiRoot(expensifySource || attribs.src),
                isAuthTokenRequired: Boolean(expensifySource),
                file: {name: attribs[CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE]},
                isReceipt: false,
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

            const transaction = TransactionUtils.getTransaction(transactionID);
            if (TransactionUtils.hasReceipt(transaction)) {
                const {image} = ReceiptUtils.getThumbnailAndImageURIs(transaction.receipt.source, transaction.filename);
                attachments.unshift({
                    source: tryResolveUrlFromApiRoot(image),
                    isAuthTokenRequired: true,
                    file: {name: transaction.filename},
                    isReceipt: true,
                });
                return;
            }
        }

        htmlParser.write(_.get(action, ['message', 0, 'html']));
    });
    htmlParser.end();

    return attachments.reverse();
}

export default extractAttachmentsFromReport;

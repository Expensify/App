import {Parser as HtmlParser} from 'htmlparser2';
import _ from 'underscore';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';

/**
 * Constructs the initial component state from report actions
 * @param {Object} parentReportAction
 * @param {Object} reportActions
 * @returns {Array}
 */
function extractAttachmentsFromReport(parentReportAction, reportActions) {
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
                hasBeenFlagged: attribs['data-flagged'] === 'true',
            });
        },
    });

    _.forEach(actions, (action, key) => {
        if (!ReportActionsUtils.shouldReportActionBeVisible(action, key) || ReportActionsUtils.isMoneyRequestAction(action)) {
            return;
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

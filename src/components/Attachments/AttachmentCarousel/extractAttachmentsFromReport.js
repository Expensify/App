import {Parser as HtmlParser} from 'htmlparser2';
import _ from 'underscore';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
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
            });
        },
    });

    _.forEach(actions, (action, key) => {
        if (!ReportActionsUtils.shouldReportActionBeVisible(action, key)) {
            return;
        }
        htmlParser.write(_.get(action, ['message', 0, 'html']));
    });
    htmlParser.end();

    return attachments.reverse();
}

export default extractAttachmentsFromReport;

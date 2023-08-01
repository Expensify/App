import {Parser as HtmlParser} from 'htmlparser2';
import _ from 'underscore';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import CONST from '../../../CONST';
import tryResolveUrlFromApiRoot from '../../../libs/tryResolveUrlFromApiRoot';
import Navigation from '../../../libs/Navigation/Navigation';

/**
 * Constructs the initial component state from report actions
 * @param {Object} report
 * @param {Array} reportActions
 * @param {String} source
 * @returns {{attachments: Array, initialPage: Number, initialItem: Object, initialActiveSource: String}}
 */
function extractAttachmentsFromReport(report, reportActions, source) {
    const actions = [ReportActionsUtils.getParentReportAction(report), ...ReportActionsUtils.getSortedReportActions(_.values(reportActions))];
    let attachments = [];

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

    attachments = attachments.reverse();

    const initialPage = _.findIndex(attachments, (a) => a.source === source);
    if (initialPage === -1) {
        Navigation.dismissModal();
        return {
            attachments: [],
            initialPage: 0,
            initialItem: undefined,
            initialActiveSource: null,
        };
    }

    const initialItem = attachments[initialPage];

    return {
        attachments,
        initialPage,
        initialItem,
        initialActiveSource: initialItem.source,
    };
}

export default extractAttachmentsFromReport;

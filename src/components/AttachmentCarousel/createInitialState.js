import _ from 'underscore';
import {Parser as HtmlParser} from 'htmlparser2';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import tryResolveUrlFromApiRoot from '../../libs/tryResolveUrlFromApiRoot';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';

/**
 * Constructs the initial component state from report actions
 * @param {propTypes} props
 * @returns {{page: Number, attachments: Array}}
 */
function createInitialState(props) {
    const actions = [ReportActionsUtils.getParentReportAction(props.report), ...ReportActionsUtils.getSortedReportActions(_.values(props.reportActions))];
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

    // Inverting the list for touchscreen devices that can swipe or have an animation when scrolling
    // promotes the natural feeling of swiping left/right to go to the next/previous image
    // We don't want to invert the list for desktop/web because this interferes with mouse
    // wheel or trackpad scrolling (in cases like document preview where you can scroll vertically)
    if (DeviceCapabilities.canUseTouchScreen()) {
        attachments.reverse();
    }

    const page = _.findIndex(attachments, (a) => a.source === props.source);
    if (page === -1) {
        Navigation.dismissModal();
    }

    // Update the parent modal's state with the source and name from the mapped attachments
    props.onNavigate(attachments[page]);

    return {
        page,
        attachments,
    };
}

export default createInitialState;

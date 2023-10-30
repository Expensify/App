import * as Localize from './Localize';
import * as Session from './actions/Session';
import * as Report from './actions/Report';
import * as Expensicons from '../components/Icon/Expensicons';

/**
 * @param {Object} report
 * @returns {Object} pin/unpin object
 */
function getPinMenuItem(report) {
    if (!report.isPinned) {
        return {
            icon: Expensicons.Pin,
            text: Localize.translateLocal('common.pin'),
            onSelected: Session.checkIfActionIsAllowed(() => Report.togglePinnedState(report.reportID, report.isPinned)),
        };
    }
    return {
        icon: Expensicons.Pin,
        text: Localize.translateLocal('common.unPin'),
        onSelected: Session.checkIfActionIsAllowed(() => Report.togglePinnedState(report.reportID, report.isPinned)),
    };
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getPinMenuItem,
};

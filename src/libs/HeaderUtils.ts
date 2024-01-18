import type {ThreeDotsMenuItem} from '@components/HeaderWithBackButton/types';
import * as Expensicons from '@components/Icon/Expensicons';
import type OnyxReport from '@src/types/onyx/Report';
import * as Report from './actions/Report';
import * as Session from './actions/Session';
import * as Localize from './Localize';

function getPinMenuItem(report: OnyxReport): ThreeDotsMenuItem {
    const isPinned = !!report.isPinned;

    return {
        icon: Expensicons.Pin,
        text: Localize.translateLocal(isPinned ? 'common.unPin' : 'common.pin'),
        onSelected: Session.checkIfActionIsAllowed(() => Report.togglePinnedState(report.reportID, isPinned)),
    };
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getPinMenuItem,
};

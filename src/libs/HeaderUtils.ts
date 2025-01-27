import type {ThreeDotsMenuItem} from '@components/HeaderWithBackButton/types';
import * as Expensicons from '@components/Icon/Expensicons';
import ROUTES from '@src/ROUTES';
import type OnyxReport from '@src/types/onyx/Report';
import {togglePinnedState} from './actions/Report';
import {callFnIfActionIsAllowed} from './actions/Session';
import {translateLocal} from './Localize';
import Navigation from './Navigation/Navigation';

function getPinMenuItem(report: OnyxReport): ThreeDotsMenuItem {
    const isPinned = !!report.isPinned;

    return {
        icon: Expensicons.Pin,
        text: translateLocal(isPinned ? 'common.unPin' : 'common.pin'),
        onSelected: callFnIfActionIsAllowed(() => togglePinnedState(report.reportID, isPinned)),
    };
}

function getShareMenuItem(report: OnyxReport, backTo?: string): ThreeDotsMenuItem {
    return {
        icon: Expensicons.QrCode,
        text: translateLocal('common.share'),
        onSelected: () => Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.getRoute(report?.reportID ?? '', backTo)),
    };
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getPinMenuItem,
    getShareMenuItem,
};

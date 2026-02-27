import type {ThreeDotsMenuItem} from '@components/HeaderWithBackButton/types';
import * as Expensicons from '@components/Icon/Expensicons';
import ROUTES from '@src/ROUTES';
import type OnyxReport from '@src/types/onyx/Report';
import {togglePinnedState} from './actions/Report';
import {callFunctionIfActionIsAllowed} from './actions/Session';
import Navigation from './Navigation/Navigation';

function getPinMenuItem(report: OnyxReport): ThreeDotsMenuItem {
    const isPinned = !!report.isPinned;

    return {
        icon: Expensicons.Pin,
        translationKey: isPinned ? 'common.unPin' : 'common.pin',
        onSelected: callFunctionIfActionIsAllowed(() => togglePinnedState(report.reportID, isPinned)),
    };
}

function getShareMenuItem(report: OnyxReport, backTo?: string): ThreeDotsMenuItem {
    return {
        icon: Expensicons.QrCode,
        translationKey: 'common.share',
        onSelected: () => Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.getRoute(report?.reportID, backTo)),
    };
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getPinMenuItem,
    getShareMenuItem,
};

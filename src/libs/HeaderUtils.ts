import type {ThreeDotsMenuItem} from '@components/HeaderWithBackButton/types';
import ROUTES from '@src/ROUTES';
import type OnyxReport from '@src/types/onyx/Report';
import type IconAsset from '@src/types/utils/IconAsset';
import {togglePinnedState} from './actions/Report';
import {callFunctionIfActionIsAllowed} from './actions/Session';
import Navigation from './Navigation/Navigation';

type HeaderUtilsIcons = {
    Pin: IconAsset;
    QrCode: IconAsset;
};

function getPinMenuItem(report: OnyxReport, icons: HeaderUtilsIcons): ThreeDotsMenuItem {
    const isPinned = !!report.isPinned;

    return {
        icon: icons.Pin,
        translationKey: isPinned ? 'common.unPin' : 'common.pin',
        onSelected: callFunctionIfActionIsAllowed(() => togglePinnedState(report.reportID, isPinned)),
    };
}

function getShareMenuItem(report: OnyxReport, icons: HeaderUtilsIcons, backTo?: string): ThreeDotsMenuItem {
    return {
        icon: icons.QrCode,
        translationKey: 'common.share',
        onSelected: () => Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.getRoute(report?.reportID, backTo)),
    };
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getPinMenuItem,
    getShareMenuItem,
};

export type {HeaderUtilsIcons};

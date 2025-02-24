import type {OnyxEntry} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';

function isSidePaneHidden(sidePane: OnyxEntry<OnyxTypes.SidePane>, isExtraLargeScreenWidth: boolean) {
    if (!isExtraLargeScreenWidth && !sidePane?.openMobile) {
        return true;
    }

    if (isExtraLargeScreenWidth && !sidePane?.open) {
        return true;
    }

    return false;
}

function substituteRouteParameters(route: string, params: Record<string, string>) {
    let updatedRoute = route;

    if (params.policyID && route.includes(params.policyID)) {
        updatedRoute = updatedRoute.replace(params.policyID, ':policyID');
    }

    if (params.reportID && route.includes(params.reportID)) {
        updatedRoute = updatedRoute.replace(params.reportID, ':reportID');
    }

    return updatedRoute;
}

export {isSidePaneHidden, substituteRouteParameters};

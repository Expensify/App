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

function substituteRouteParameters(route: string, params: Record<string, unknown>) {
    let updatedRoute = route;

    function searchAndReplace(obj: Record<string, unknown>) {
        for (const key in obj) {
            if (key === 'path') {
                // eslint-disable-next-line no-continue
                continue;
            }

            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
                searchAndReplace(value as Record<string, unknown>);
            } else if (typeof value === 'string' && route.includes(value)) {
                updatedRoute = updatedRoute.replace(value, `:${key}`);
            }
        }
    }

    searchAndReplace(params);

    return updatedRoute;
}

export {isSidePaneHidden, substituteRouteParameters};

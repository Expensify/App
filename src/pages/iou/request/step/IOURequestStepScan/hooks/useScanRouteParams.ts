import type {ScanRoute} from '@pages/iou/request/step/IOURequestStepScan/types';

import CONST from '@src/CONST';

import type {Route} from '@react-navigation/native';

import {useNavigation, useRoute} from '@react-navigation/native';

type ScanRouteInfo = Partial<Pick<ScanRoute['params'], 'iouType'>> & {
    /** The route name — used to determine if we're in the create-scan flow vs edit/replace */
    routeName: string;
};

/** Untyped navigation hooks give params as a plain object, so read iouType only when the route has one. */
function getIOUType(params: Route<string>['params']) {
    if (!params || !('iouType' in params)) {
        return undefined;
    }
    return Object.values(CONST.IOU.TYPE).find((type) => type === params.iouType);
}

/**
 * Returns the consumed IOU type and route name for the scan screen.
 * When rendered as a standalone screen (STEP_SCAN), params come from useRoute() directly.
 * When rendered inside a TopTab (CREATE flow), params come from the parent navigator's current route.
 */
function useScanRouteParams(): ScanRouteInfo {
    const route = useRoute();
    const navigation = useNavigation();

    if (route.params) {
        return {iouType: getIOUType(route.params), routeName: route.name};
    }

    const parentState = navigation.getParent()?.getState();
    const parentRoute = parentState?.routes[parentState?.index ?? 0];
    return {iouType: getIOUType(parentRoute?.params), routeName: parentRoute?.name ?? ''};
}

export default useScanRouteParams;

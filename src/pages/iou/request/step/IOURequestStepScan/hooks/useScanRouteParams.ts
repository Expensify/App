import {useNavigation, useRoute} from '@react-navigation/native';
import type {ScanRoute} from '@pages/iou/request/step/IOURequestStepScan/types';

type ScanRouteParams = ScanRoute['params'];

type ScanRouteInfo = ScanRouteParams & {
    /** The route name — used to determine if we're in the create-scan flow vs edit/replace */
    routeName: string;
};

/**
 * Returns typed route params and route name for the scan screen.
 * When rendered as a standalone screen (STEP_SCAN), params come from useRoute() directly.
 * When rendered inside a TopTab (CREATE flow), params come from the parent navigator's current route.
 */
function useScanRouteParams(): ScanRouteInfo {
    const route = useRoute();
    const navigation = useNavigation();

    if (route.params) {
        return {...(route.params as ScanRouteParams), routeName: route.name};
    }

    const parentState = navigation.getParent()?.getState();
    const parentRoute = parentState?.routes[parentState?.index ?? 0];
    return {...(parentRoute?.params as ScanRouteParams), routeName: parentRoute?.name ?? ''};
}

export default useScanRouteParams;
export type {ScanRouteParams, ScanRouteInfo};

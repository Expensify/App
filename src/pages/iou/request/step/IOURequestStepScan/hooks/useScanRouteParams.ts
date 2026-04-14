import {useNavigation, useRoute} from '@react-navigation/native';
import type {ScanRoute} from '@pages/iou/request/step/IOURequestStepScan/types';

type ScanRouteParams = ScanRoute['params'];

/**
 * Returns typed route params for the scan screen.
 * When rendered as a standalone screen (STEP_SCAN), params come from useRoute() directly.
 * When rendered inside a TopTab (CREATE flow), params come from the parent navigator's current route.
 */
function useScanRouteParams(): ScanRouteParams {
    const route = useRoute();
    const navigation = useNavigation();

    if (route.params) {
        return route.params as ScanRouteParams;
    }

    const parentState = navigation.getParent()?.getState();
    const parentRoute = parentState?.routes[parentState?.index ?? 0];
    return parentRoute?.params as ScanRouteParams;
}

export default useScanRouteParams;
export type {ScanRouteParams};

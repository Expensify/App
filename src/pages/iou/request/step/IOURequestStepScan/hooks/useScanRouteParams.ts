import type {ScanRoute} from '@pages/iou/request/step/IOURequestStepScan/types';

import CONST from '@src/CONST';

import {useNavigation, useRoute} from '@react-navigation/native';

type ScanRouteInfo = Partial<Pick<ScanRoute['params'], 'iouType'>> & {
    /** The route name — used to determine if we're in the create-scan flow vs edit/replace */
    routeName: string;
};

/**
 * Returns the consumed IOU type and route name for the scan screen.
 * When rendered as a standalone screen (STEP_SCAN), params come from useRoute() directly.
 * When rendered inside a TopTab (CREATE flow), params come from the parent navigator's current route.
 */
function useScanRouteParams(): ScanRouteInfo {
    const route = useRoute();
    const navigation = useNavigation();

    if (route.params) {
        const params = route.params;
        const iouType = 'iouType' in params ? Object.values(CONST.IOU.TYPE).find((value) => value === params.iouType) : undefined;
        return {iouType, routeName: route.name};
    }

    const parentState = navigation.getParent()?.getState();
    const parentRoute = parentState?.routes[parentState?.index ?? 0];
    const params = parentRoute?.params;
    const iouType = params && 'iouType' in params ? Object.values(CONST.IOU.TYPE).find((value) => value === params.iouType) : undefined;
    return {iouType, routeName: parentRoute?.name ?? ''};
}

export default useScanRouteParams;

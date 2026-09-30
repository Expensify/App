import {isPreMountedUnderCurrentFullscreenRouteKey} from '@libs/Navigation/helpers/preMountedUnderCurrentFullscreenRouteKey';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ParamListBase} from '@react-navigation/native';

import type {CustomHistoryEntry} from './types';

function enhanceStateWithHistory(state: PlatformStackNavigationState<ParamListBase>) {
    return {
        ...state,
        // Every history rebuild goes through here. The pre-mounted TAB_NAVIGATOR must never become a history entry, or
        // useLinking would push a browser entry for a route the user has not seen yet.
        history: state.routes.filter((route) => !isPreMountedUnderCurrentFullscreenRouteKey(route.key)).map((route) => ({...route})) as CustomHistoryEntry[],
    };
}

// eslint-disable-next-line import/prefer-default-export
export {enhanceStateWithHistory};

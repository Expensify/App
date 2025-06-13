import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import type {Screen} from '@src/SCREENS';

function getParamsFromRoute(screenName: string): string[] {
    const routeConfig = normalizedConfigs[screenName as Screen];

    const route = routeConfig.pattern;

    return route.match(/(?<=[:?&])(\w+)(?=[/=?&]|$)/g) ?? [];
}

export default getParamsFromRoute;

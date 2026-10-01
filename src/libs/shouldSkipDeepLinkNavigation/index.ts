import {isTestToolsRoute} from './common';

export default function shouldSkipDeepLinkNavigation(route: string) {
    return isTestToolsRoute(route);
}

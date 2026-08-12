import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

// Shared by AuthScreens (lazy screen registration) and SearchRouterWarmup (idle pre-evaluation).
const loadSearchRouterPage = () => require<ReactComponentModule>('../../../components/Search/SearchRouter/SearchRouterPage').default;
const loadRightModalNavigator = () => require<ReactComponentModule>('./Navigators/RightModalNavigator').default;

export {loadSearchRouterPage, loadRightModalNavigator};

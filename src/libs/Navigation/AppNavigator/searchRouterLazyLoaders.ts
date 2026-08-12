import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

// Shared between AuthScreens (registers these as the real lazy-loaded screens) and SearchRouterWarmup
// (evaluates the same modules ahead of time while the app is idle). Kept in one place so the two stay
// in sync instead of duplicating the require paths.
const loadSearchRouterPage = () => require<ReactComponentModule>('../../../components/Search/SearchRouter/SearchRouterPage').default;
const loadRightModalNavigator = () => require<ReactComponentModule>('./Navigators/RightModalNavigator').default;

export {loadSearchRouterPage, loadRightModalNavigator};

import type {ParamListBase} from '@react-navigation/native';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

type SearchSidebarProps = {
    state: PlatformStackNavigationState<ParamListBase>;
};

// The Spend LHN now lives inside the global NavigationTabBar rail (see SearchTypeMenuWide
// usage in NavigationTabBar/index.tsx). This component remains wired in as ExtraContent of
// createSearchFullscreenNavigator but renders nothing.
function SearchSidebar(_props: SearchSidebarProps) {
    return null;
}

SearchSidebar.displayName = 'SearchSidebar';

export default SearchSidebar;

import type NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';

import type {ValueOf} from 'type-fest';

type DebugTabViewPlaceholderProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

export default DebugTabViewPlaceholderProps;

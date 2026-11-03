import type NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';

import type {ValueOf} from 'type-fest';

type TabBarBottomContentProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

export default TabBarBottomContentProps;

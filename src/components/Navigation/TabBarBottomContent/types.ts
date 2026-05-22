import type {ValueOf} from 'type-fest';
import type NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';

type TabBarBottomContentProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

export default TabBarBottomContentProps;

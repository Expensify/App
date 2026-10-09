import type NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';

import type {ValueOf} from 'type-fest';

type Props = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

function DebugTabViewPlaceholder(_props: Props) {
    return null;
}

export default DebugTabViewPlaceholder;

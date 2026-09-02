import type {BottomTabScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';

// The Home tab is the only tab that opts into React <Activity>. The other tabs host split navigators whose persistent
// sidebars must stay live, so they never pick a behavior.
const HOME_TAB_SCREEN_OPTIONS: BottomTabScreenOptions = {
    nonTopScreenBehavior: 'activity',
};

export default HOME_TAB_SCREEN_OPTIONS;

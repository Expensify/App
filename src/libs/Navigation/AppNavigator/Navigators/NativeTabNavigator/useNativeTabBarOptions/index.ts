import type {NativeTabRouteName} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/nativeTabItemUtils';
import type {MoreMenuItemID} from '@libs/Navigation/MoreMenu/getMoreTabItemID';

import type {NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';

import type NativeTabBarOptionsParams from './types';

type UseNativeTabBarOptions = (params: NativeTabBarOptionsParams) => {
    screenOptions: NativeBottomTabNavigationOptions;
    /** `moreTabItemID` is the More menu entry the flat nav More item shows, see getMoreTabItemID */
    getTabOptions: (name: NativeTabRouteName, moreTabItemID?: MoreMenuItemID) => NativeBottomTabNavigationOptions;
};

/** Only iOS and Android have a native tab bar, so other platforms get no options. */
const useNativeTabBarOptions: UseNativeTabBarOptions = () => ({screenOptions: {}, getTabOptions: () => ({})});

const getFloatingButtonsBottom = (bottomInset: number) => bottomInset;

export default useNativeTabBarOptions;
export {getFloatingButtonsBottom};

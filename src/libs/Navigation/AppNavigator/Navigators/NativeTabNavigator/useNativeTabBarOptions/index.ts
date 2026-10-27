import type {NativeTabName} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NATIVE_TAB_GLYPHS';

import type {NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';

import type NativeTabBarOptionsParams from './types';

type UseNativeTabBarOptions = (params: NativeTabBarOptionsParams) => {
    screenOptions: NativeBottomTabNavigationOptions;
    getTabOptions: (name: NativeTabName) => NativeBottomTabNavigationOptions;
};

/** Only iOS and Android have a native tab bar, so other platforms get no options. */
const useNativeTabBarOptions: UseNativeTabBarOptions = () => ({screenOptions: {}, getTabOptions: () => ({})});

const getFloatingButtonsBottom = (bottomInset: number) => bottomInset;

export default useNativeTabBarOptions;
export {getFloatingButtonsBottom};

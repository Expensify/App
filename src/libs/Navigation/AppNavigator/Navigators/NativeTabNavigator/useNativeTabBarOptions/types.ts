import type {NativeTabItemKind} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NATIVE_TAB_GLYPHS';

type NativeTabBarOptionsParams = {
    shouldShowNativeTabBar: boolean;
    dotColors: Partial<Record<NativeTabItemKind, string>>;
    /** One label per kind of item, which is also how many items the bar shows. */
    tabLabels: Record<NativeTabItemKind, string>;
};

export default NativeTabBarOptionsParams;

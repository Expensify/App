type NativeTabBarOptionsParams = {
    shouldShowNativeTabBar: boolean;
    /** Whether the bar is laid out as a column along the side of the screen, as UIKit does on a foldable iPhone. */
    isTabBarVertical: boolean;
    dotColors: Record<string, string | undefined>;
    tabLabels: Record<string, string>;
};

export default NativeTabBarOptionsParams;

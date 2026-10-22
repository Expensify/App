type NativeTabBarOptionsParams = {
    shouldShowNativeTabBar: boolean;
    /** Whether the bar is laid out as a column along the side of the screen, as UIKit does on a foldable iPhone. */
    isTabBarVertical: boolean;
    /** Whether the account tab has an item in a narrow layout's bar, so its avatar is drawn. */
    isAccountAvatarShown: boolean;
    dotColors: Record<string, string | undefined>;
    tabLabels: Record<string, string>;
};

export default NativeTabBarOptionsParams;

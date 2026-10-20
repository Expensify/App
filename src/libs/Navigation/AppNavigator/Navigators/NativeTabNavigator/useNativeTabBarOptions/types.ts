type NativeTabBarOptionsParams = {
    shouldShowNativeTabBar: boolean;
    /** Whether the focused tab has no item in the bar, so every item is drawn unselected. */
    isTabBarSelectionHidden: boolean;
    /** Whether the account tab has an item in a narrow layout's bar, so its avatar is drawn. */
    isAccountAvatarShown: boolean;
    dotColors: Record<string, string | undefined>;
    tabLabels: Record<string, string>;
};

export default NativeTabBarOptionsParams;

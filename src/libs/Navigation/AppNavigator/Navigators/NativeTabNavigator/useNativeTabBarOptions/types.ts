type NativeTabBarOptionsParams = {
    shouldShowNativeTabBar: boolean;
    /** Whether the account tab has an item in a narrow layout's bar, so its avatar is drawn. */
    isAccountAvatarShown: boolean;
    dotColors: Record<string, string | undefined>;
    tabLabels: Record<string, string>;
};

export default NativeTabBarOptionsParams;

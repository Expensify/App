type CustomStatusBarAndBackgroundStateContextType = {
    /** Whether the root status bar is enabled. Disabled when a nested CustomStatusBar is mounted (e.g. SignInPage). */
    isRootStatusBarEnabled: boolean;
};

type CustomStatusBarAndBackgroundActionsContextType = {
    /** Enable or disable the root status bar. Nested status bars call setRootStatusBarEnabled(false) on mount and true on unmount. */
    setRootStatusBarEnabled: (isEnabled: boolean) => void;
};

export type {CustomStatusBarAndBackgroundStateContextType, CustomStatusBarAndBackgroundActionsContextType};

type ActionPayloadParams = {
    [key: string]: unknown;
    screen?: string;
    params?: ActionPayloadParams;
    path?: string;
};

type ActionPayload = {
    params?: ActionPayloadParams;
};

type LinkToOptions = {
    // To explicitly set the action type to replace.
    forceReplace?: boolean;
    /**
     * Prevents a directly opened split destination from adding its sidebar as an intermediate Back destination on narrow layouts.
     * SplitRouter always keeps the sidebar when `getIsNarrowLayout()` is false, which can differ from a caller's responsive-layout predicate.
     */
    shouldSkipInitialSplitNavigatorSidebar?: boolean;
    // Callback to execute after the navigation transition animation completes.
    afterTransition?: () => void;
    // If true, waits for ongoing transitions to finish before navigating. Defaults to false (navigates immediately).
    waitForTransition?: boolean;
    // If true, skip full-screen route matching when opening an RHP. Use when the central pane should stay on the current tab.
    skipMatchingFullScreenRoute?: boolean;
};

export type {ActionPayload, ActionPayloadParams, LinkToOptions};

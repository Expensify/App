const defaultScreenOptions = {
    animation: 'none',
} as const;

/**
 * On web, tab switches in routed tab navigators should replace the browser history entry instead of
 * pushing a new one (see `getTabHistoryReplacementRouter`). Native has no browser history, so this is
 * web-only.
 */
const shouldReplaceTabHistoryOnTabSwitch = true;

export {defaultScreenOptions, shouldReplaceTabHistoryOnTabSwitch};

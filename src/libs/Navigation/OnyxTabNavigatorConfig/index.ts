const defaultScreenOptions = {
    animation: 'default',
} as const;

/**
 * Native has no browser history, so tab switches never create poppable history entries and the
 * tab-history replacement (see `getTabHistoryReplacementRouter`) must stay off to preserve the default
 * `backBehavior: 'initialRoute'` semantics.
 */
const shouldReplaceTabHistoryOnTabSwitch = false;

export {defaultScreenOptions, shouldReplaceTabHistoryOnTabSwitch};

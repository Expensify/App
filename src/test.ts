/* eslint-disable no-console */
console.log('CONST');

export default withOnyx<ExpensifyProps, ExpensifyOnyxProps>({
    isCheckingPublicRoom: {
        key: ONYXKEYS.IS_CHECKING_PUBLIC_ROOM,
        initWithStoredValues: false,
    },
    updateAvailable: {
        key: ONYXKEYS.UPDATE_AVAILABLE,
        initWithStoredValues: false,
    },
    updateRequired: {
        key: ONYXKEYS.UPDATE_REQUIRED,
        initWithStoredValues: false,
    },
    isSidebarLoaded: {
        key: ONYXKEYS.IS_SIDEBAR_LOADED,
    },
    screenShareRequest: {
        key: ONYXKEYS.SCREEN_SHARE_REQUEST,
    },
    focusModeNotification: {
        key: ONYXKEYS.FOCUS_MODE_NOTIFICATION,
        initWithStoredValues: false,
    },
    lastVisitedPath: {
        key: ONYXKEYS.LAST_VISITED_PATH,
    },
})(Expensify);

const ELECTRON_EVENTS = {
    BLUR: 'blur',
    FOCUS: 'focus',
    LOCALE_UPDATED: 'locale-updated',
    REQUEST_DEVICE_ID: 'requestDeviceID',
    REQUEST_FOCUS_APP: 'requestFocusApp',
    REQUEST_UPDATE_BADGE_COUNT: 'requestUpdateBadgeCount',
    REQUEST_VISIBILITY: 'requestVisibility',
    KEYBOARD_SHORTCUTS_PAGE: 'keyboard-shortcuts-page',
    START_UPDATE: 'start-update',
    UPDATE_DOWNLOADED: 'update-downloaded',
    DOWNLOAD: 'download',
    DOWNLOAD_COMPLETED: 'download-completed',
    DOWNLOAD_FAILED: 'download-started',
    DOWNLOAD_CANCELED: 'download-canceled',
    SILENT_UPDATE: 'silent-update',
    OPEN_LOCATION_SETTING: 'open-location-setting',
    CHECK_LOCATION_PERMISSION: 'check-location-permission',
} as const;

export default ELECTRON_EVENTS;

import type ForegroundNotificationsModule from './types';

/**
 * Configures notification handling while in the foreground on iOS and Android. This is a no-op on other platforms.
 */
const ForegroundNotifications: ForegroundNotificationsModule = {
    configureForegroundNotifications: () => {},
    disableForegroundNotifications: () => {},
};

export default ForegroundNotifications;

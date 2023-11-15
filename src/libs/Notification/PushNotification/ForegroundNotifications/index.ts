import ForegroundNotifications from './types';

/**
 * Configures notification handling while in the foreground on iOS and Android. This is a no-op on other platforms.
 */
const foregroundNotifications: ForegroundNotifications = {
    configureForegroundNotifications: () => {},
    disableForegroundNotifications: () => {},
};

export default foregroundNotifications;

import type {SettingsSplitNavigatorParamList} from '@navigation/types';

import SCREENS from '@src/SCREENS';

/**
 * Deeplink-only variant of SETTINGS_TO_RHP. Consulted ONLY when navigation state is built from a path
 * (deeplink / browser refresh / cold load) via the `isDeeplink` flag in getMatchingFullScreenRoute,
 * so these RHP screens still get a settings page underneath on a fresh load without forcing it for in-app navigation.
 */
const SETTINGS_TO_RHP_DEEPLINK: Partial<Record<keyof SettingsSplitNavigatorParamList, string[]>> = {
    // These RHP screens are also opened from a chat or from Home, so they must not force the settings page underneath on click.
    [SCREENS.SETTINGS.WALLET.ROOT]: [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_DETAILS, SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT],
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]: [SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD],
};

export default SETTINGS_TO_RHP_DEEPLINK;

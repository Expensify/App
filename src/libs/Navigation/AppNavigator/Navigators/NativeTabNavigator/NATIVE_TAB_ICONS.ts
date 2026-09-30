import buildingsIcon from '@assets/images/native-tab-icons/buildings.png';
import homeIcon from '@assets/images/native-tab-icons/home.png';
import inboxIcon from '@assets/images/native-tab-icons/inbox.png';
import profileIcon from '@assets/images/native-tab-icons/profile.png';
import receiptMultipleIcon from '@assets/images/native-tab-icons/receipt-multiple.png';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NativeBottomTabIcon} from '@react-navigation/bottom-tabs/unstable';

/** The glyph each native tab draws, keyed by the tab's route name. The bar tints them for both selection states. */
const NATIVE_TAB_ICONS = {
    [SCREENS.HOME]: {type: 'image', source: homeIcon},
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: {type: 'image', source: inboxIcon},
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: {type: 'image', source: receiptMultipleIcon},
    [NAVIGATORS.WORKSPACE_NAVIGATOR]: {type: 'image', source: buildingsIcon},
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: {type: 'image', source: profileIcon},
} as const satisfies Record<string, NativeBottomTabIcon>;

export default NATIVE_TAB_ICONS;

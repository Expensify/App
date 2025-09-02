import type {HybridObject} from 'react-native-nitro-modules';
import type {ValueOf} from 'type-fest';

type NavBarButtonStyle = 'light' | 'dark';
const NAVIGATION_BAR_TYPE = {
    // We consider there to be no navigation bar in one of these cases:
    // 1. The device has physical navigation buttons
    // 2. The device uses gesture navigation without a gesture bar.
    // 3. The device uses hidden (auto-hiding) soft keys.
    NONE: 'none',
    SOFT_KEYS: 'soft-keys',
    GESTURE_BAR: 'gesture-bar',
}

type NavigationBarType = ValueOf<typeof NAVIGATION_BAR_TYPE>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface NavBarManagerModule extends HybridObject<{ios: 'swift', android: 'kotlin'}> {
    setButtonStyle(style: NavBarButtonStyle): void;
    getType(): NavigationBarType;
}

export {NAVIGATION_BAR_TYPE};
export type {NavBarManagerModule, NavBarButtonStyle, NavigationBarType};

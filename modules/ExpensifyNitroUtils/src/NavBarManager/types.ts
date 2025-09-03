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

type NavBarManagerType = {
    setButtonStyle: (style: NavBarButtonStyle) => void;
    getType: () => NavigationBarType;
};

export type {NavBarManagerType, NavigationBarType, NavBarButtonStyle};
export {NAVIGATION_BAR_TYPE};

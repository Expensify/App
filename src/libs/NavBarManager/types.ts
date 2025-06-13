import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type NavBarButtonStyle = 'light' | 'dark';

type NavigationBarType = ValueOf<typeof CONST.NAVIGATION_BAR_TYPE>;

type NavBarManager = {
    setButtonStyle: (style: NavBarButtonStyle) => void;
    getType: () => NavigationBarType;
};

export default NavBarManager;
export type {NavBarButtonStyle, NavigationBarType};

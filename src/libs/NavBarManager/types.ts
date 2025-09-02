import type {NavBarButtonStyle, NavigationBarType} from '@expensify/nitro-utils';

type NavBarManager = {
    setButtonStyle: (style: NavBarButtonStyle) => void;
    getType: () => NavigationBarType;
};

export default NavBarManager;

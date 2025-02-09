type NavBarButtonStyle = 'light' | 'dark';

type NavBarManager = {
    setButtonStyle: (style: NavBarButtonStyle) => void;
};

export default NavBarManager;
export type {NavBarButtonStyle};

import type {Color, ThemeColors} from '@styles/theme/types';

type NavBarButtonStyle = 'light' | 'dark';

type NavBarManager = {
    setTheme(theme: ThemeColors): void;
    setButtonStyle: (style: NavBarButtonStyle) => void;
    setBackgroundColor: (color: Color) => void;
};

export default NavBarManager;
export type {NavBarButtonStyle};

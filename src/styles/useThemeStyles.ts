import {useContext} from 'react';
import ThemeStylesContext from './ThemeStylesContext';

function useThemeStyles() {
    const themeStyles = useContext(ThemeStylesContext);

    if (!themeStyles) {
        throw new Error('ThemeStylesContext was null! Are you sure that you wrapped the component under a <ThemeStylesProvider>?');
    }

    return themeStyles;
}

export default useThemeStyles;

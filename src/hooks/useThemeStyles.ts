import {useContext} from 'react';
import ThemeStylesContext from '@styles/theme/context/ThemeStylesContext';

function useThemeStyles() {
    const themeStylesContext = useContext(ThemeStylesContext);

    if (!themeStylesContext) {
        throw new Error('ThemeStylesContext was null! Are you sure that you wrapped the component under a <ThemeStylesProvider>?');
    }

    return themeStylesContext.styles;
}

export default useThemeStyles;

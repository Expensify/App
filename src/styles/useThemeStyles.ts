import {useContext} from 'react';
import ThemeStylesContext from './ThemeStylesContext';

function useThemeStyles() {
    const themeStyles = useContext(ThemeStylesContext);

    if (!themeStyles) {
        throw new Error('StylesContext was null! Are you sure that you wrapped the component under a <ThemeStylesProvider>?');
    }

    // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return themeStyles;
}

export default useThemeStyles;

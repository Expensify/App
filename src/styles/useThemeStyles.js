import {useContext} from 'react';
import ThemeStylesContext from './ThemeStylesContext';

function useThemeStyles() {
    const contextValue = useContext(ThemeStylesContext);

    if (contextValue == null) {
        throw new Error('StylesContext was null! Are you sure that you wrapped the component under a <StylesProvider>?');
    }

    return contextValue;
}

export default useThemeStyles;

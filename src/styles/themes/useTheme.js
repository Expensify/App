import {useContext} from 'react';
import ThemeContext from './ThemeContext';

function useTheme() {
    const contextValue = useContext(ThemeContext);

    if (contextValue == null) {
        throw new Error('StylesContext was null! Are you sure that you wrapped the component under a <ThemeProvider>?');
    }

    return contextValue;
}

export default useTheme;

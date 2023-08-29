import {useContext} from 'react';
import ThemeContext from './ThemeContext';

function useTheme() {
    const theme = useContext(ThemeContext);

    if (!theme) {
        throw new Error('StylesContext was null! Are you sure that you wrapped the component under a <ThemeProvider>?');
    }

    return theme;
}

export default useTheme;

import ThemeContext from '@styles/theme/context/ThemeContext';
import type {ThemeColors} from '@styles/theme/types';

import {useContext} from 'react';

function useTheme(): ThemeColors {
    const theme = useContext(ThemeContext);

    if (!theme) {
        throw new Error('ThemeContext was null! Are you sure that you wrapped the component under a <ThemeProvider>?');
    }

    return theme;
}

export default useTheme;

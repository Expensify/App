import React from 'react';
// eslint-disable-next-line no-restricted-imports
import themes from '@styles/theme';
import ThemeContext from '@styles/theme/context/ThemeContext';

type ThemeProviderProps = React.PropsWithChildren;

function ThemeProvider({children}: ThemeProviderProps) {
    // Dark mode not yet supported
    return <ThemeContext.Provider value={themes.light}>{children}</ThemeContext.Provider>;
}

ThemeProvider.displayName = 'ThemeProvider';

export default ThemeProvider;

import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import useThemePreference from '@hooks/useThemePreference';

import React from 'react';

/**
 * Puts the app's own theme back for the menus that open off the bar, which would otherwise inherit the inverted theme
 * the bar itself renders under. The bar stays inverted so it stands out against the table. Its menus read as the
 * popovers they are everywhere else in the app.
 *
 * `useThemePreference` reads the preference rather than the surrounding context, so this reports the page's theme even
 * from inside the bar's inverted subtree.
 */
function BulkActionBarMenuTheme({children}: React.PropsWithChildren) {
    const pageThemePreference = useThemePreference();

    return (
        <ThemeProvider theme={pageThemePreference}>
            <ThemeStylesProvider>{children}</ThemeStylesProvider>
        </ThemeProvider>
    );
}

BulkActionBarMenuTheme.displayName = 'BulkActionBarMenuTheme';

export default BulkActionBarMenuTheme;

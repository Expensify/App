import React, {useMemo} from 'react';
import ThemeIllustrationsContext from '@styles/context/ThemeIllustrationsContext';
import useThemePreference from '@styles/theme/useThemePreference';
import Illustrations from './illustrations';

type ThemeIllustrationsProviderProps = {
    children: React.ReactNode;
};

function ThemeIllustrationsProvider({children}: ThemeIllustrationsProviderProps) {
    const themePreference = useThemePreference();

    const illustrations = useMemo(() => Illustrations[themePreference], [themePreference]);

    return <ThemeIllustrationsContext.Provider value={illustrations}>{children}</ThemeIllustrationsContext.Provider>;
}

ThemeIllustrationsProvider.displayName = 'ThemeIllustrationsProvider';

export default ThemeIllustrationsProvider;

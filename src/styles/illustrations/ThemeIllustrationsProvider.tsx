import React, {useMemo} from 'react';
import useThemePreference from '@styles/themes/useThemePreference';
import DarkIllustrations from './dark';
import LightIllustrations from './light';
import ThemeIllustrationsContext from './ThemeIllustrationsContext';

type ThemeIllustrationsProviderProps = {
    children: React.ReactNode;
};

function ThemeIllustrationsProvider({children}: ThemeIllustrationsProviderProps) {
    const themePreference = useThemePreference();

    const illustrations = useMemo(() => (themePreference === 'dark' ? DarkIllustrations : LightIllustrations), [themePreference]);

    return <ThemeIllustrationsContext.Provider value={illustrations}>{children}</ThemeIllustrationsContext.Provider>;
}

ThemeIllustrationsProvider.displayName = 'ThemeIllustrationsProvider';

export default ThemeIllustrationsProvider;

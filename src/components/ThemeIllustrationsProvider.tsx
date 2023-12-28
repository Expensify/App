import React, {useMemo} from 'react';
import useThemePreference from '@hooks/useThemePreference';
import ThemeIllustrationsContext from '@styles/theme/context/ThemeIllustrationsContext';
import Illustrations from '@styles/theme/illustrations';

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

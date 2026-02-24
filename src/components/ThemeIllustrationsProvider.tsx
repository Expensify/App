import React, {useMemo} from 'react';
import useThemePreference from '@hooks/useThemePreference';
import ThemeIllustrationsContext from '@styles/theme/context/ThemeIllustrationsContext';
// eslint-disable-next-line no-restricted-imports
import illustrations from '@styles/theme/illustrations';

type ThemeIllustrationsProviderProps = {
    children: React.ReactNode;
};

function ThemeIllustrationsProvider({children}: ThemeIllustrationsProviderProps) {
    const themePreference = useThemePreference();

    const themeIllustrations = useMemo(() => illustrations[themePreference], [themePreference]);

    return <ThemeIllustrationsContext.Provider value={themeIllustrations}>{children}</ThemeIllustrationsContext.Provider>;
}

export default ThemeIllustrationsProvider;

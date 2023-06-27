import {useState, useEffect} from 'react';
import {Appearance} from 'react-native';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';

const DEFAULT_THEME = CONST.COLOR_THEME.DARK;

function useThemePreference() {
    const [themePreference, setThemePreference] = useState(DEFAULT_THEME);
    const [systemColorTheme, setSystemColorTheme] = useState();

    useEffect(() => {
        const systemThemeSubscription = Appearance.addChangeListener(({colorScheme}) => setSystemColorTheme(colorScheme));
        return systemThemeSubscription.remove();
    }, []);

    useEffect(() => {
        // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
        const connectionId = Onyx.connect({
            key: ONYXKEYS.COLOR_THEME,
            callback: (newColorTheme) => {
                const theme = newColorTheme || DEFAULT_THEME;

                if (theme === 'system') setThemePreference(systemColorTheme);
                else setThemePreference(theme);
            },
        });

        return () => Onyx.disconnect(connectionId);
    }, [systemColorTheme]);

    return themePreference;
}

export default useThemePreference;

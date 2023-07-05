import {useState, useEffect} from 'react';
import {Appearance} from 'react-native';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';

function useThemePreference() {
    const [themePreference, setThemePreference] = useState(CONST.DEFAULT_THEME);
    const [systemTheme, setSystemTheme] = useState();

    useEffect(() => {
        // This is used for getting the system theme, that can be set in the OS's theme settings. This will always return either "light" or "dark" and will update automatically if the OS theme changes.
        const systemThemeSubscription = Appearance.addChangeListener(({colorScheme}) => setSystemTheme(colorScheme));
        return systemThemeSubscription.remove();
    }, []);

    useEffect(() => {
        // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
        const connectionId = Onyx.connect({
            key: ONYXKEYS.THEME,
            callback: (newTheme) => {
                const theme = newTheme || DEFAULT_THEME;

                if (theme === CONST.THEME.SYSTEM) setThemePreference(systemTheme);
                else setThemePreference(theme);
            },
        });

        return () => Onyx.disconnect(connectionId);
    }, [systemTheme]);

    return themePreference;
}

export default useThemePreference;

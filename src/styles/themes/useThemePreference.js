import {useState, useEffect} from 'react';
import {Appearance} from 'react-native';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

const DEFAULT_THEME = 'dark';

function useThemePreference() {
    const [themePreference, setThemePreference] = useState('dark');
    const [systemColorTheme, setSystemColorTheme] = useState();

    useEffect(() => {
        const systemThemeSubscription = Appearance.addChangeListener(({colorScheme}) => setSystemColorTheme(colorScheme));
        return systemThemeSubscription.remove();
    }, []);

    useEffect(() => {
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

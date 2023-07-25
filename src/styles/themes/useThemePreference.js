import {useState, useEffect, useContext} from 'react';
import {Appearance} from 'react-native';
import CONST from '../../CONST';
import {PreferredThemeContext} from '../../components/OnyxProvider';

function useThemePreference() {
    const [themePreference, setThemePreference] = useState(CONST.THEME.DEFAULT);
    const [systemTheme, setSystemTheme] = useState();
    const preferredThemeContext = useContext(PreferredThemeContext);

    useEffect(() => {
        // This is used for getting the system theme, that can be set in the OS's theme settings. This will always return either "light" or "dark" and will update automatically if the OS theme changes.
        const systemThemeSubscription = Appearance.addChangeListener(({colorScheme}) => setSystemTheme(colorScheme));
        return systemThemeSubscription.remove;
    }, []);

    useEffect(() => {
        const theme = preferredThemeContext || CONST.THEME.DEFAULT;

        // If the user chooses to use the device theme settings, we need to set the theme preference to the system theme
        if (theme === CONST.THEME.SYSTEM) setThemePreference(systemTheme);
        else setThemePreference(theme);
    }, [preferredThemeContext, systemTheme]);

    return themePreference;
}

export default useThemePreference;

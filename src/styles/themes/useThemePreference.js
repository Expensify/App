import {useState, useEffect, useContext} from 'react';
import {Appearance} from 'react-native';
// import Onyx from 'react-native-onyx';
// import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import {PreferredThemeContext} from '../../components/OnyxProvider';

function useThemePreference() {
    const [themePreference, setThemePreference] = useState(CONST.THEME.DEFAULT);
    const [systemTheme, setSystemTheme] = useState();
    const preferredThemeContext = useContext(PreferredThemeContext);

    useEffect(() => {
        // This is used for getting the system theme, that can be set in the OS's theme settings. This will always return either "light" or "dark" and will update automatically if the OS theme changes.
        const systemThemeSubscription = Appearance.addChangeListener(({colorScheme}) => setSystemTheme(colorScheme));
        return systemThemeSubscription.remove();
    }, []);

    useEffect(() => {
        const theme = preferredThemeContext || CONST.THEME.DEFAULT;

        if (theme === CONST.THEME.SYSTEM) setThemePreference(systemTheme);
        else setThemePreference(theme);

        // // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
        // const connectionId = Onyx.connect({
        //     key: ONYXKEYS.PREFERRED_THEME,
        //     callback: (newTheme) => {
        //         const theme = newTheme || CONST.THEME.DEFAULT;

        //         if (theme === CONST.THEME.SYSTEM) setThemePreference(systemTheme);
        //         else setThemePreference(theme);
        //     },
        // });

        // return () => Onyx.disconnect(connectionId);
    }, [preferredThemeContext, systemTheme]);

    return themePreference;
}

export default useThemePreference;

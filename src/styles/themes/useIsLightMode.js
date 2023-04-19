import {useState, useEffect} from 'react';
import {Appearance} from 'react-native';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function useIsLightMode() {
    const [colorTheme, setColorTheme] = useState();
    const [systemColorTheme, setSystemColorTheme] = useState();

    useEffect(() => {
        const systemThemeSubscription = Appearance.addChangeListener(({colorScheme}) => setSystemColorTheme(colorScheme));
        return systemThemeSubscription.remove();
    }, []);

    useEffect(() => {
        // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
        const connectionId = Onyx.connect({
            key: ONYXKEYS.COLOR_THEME,
            callback: newColorTheme => (newColorTheme === 'system'
                ? setColorTheme(systemColorTheme) : setColorTheme(newColorTheme))
            ,
        });

        return () => Onyx.disconnect(connectionId);
    }, [systemColorTheme]);

    return colorTheme;
}

export default useIsLightMode;

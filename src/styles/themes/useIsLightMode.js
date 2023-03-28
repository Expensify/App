import {useState, useEffect} from 'react';
import {Appearance} from 'react-native';

function useIsLightMode() {
    const [colorScheme, setColorScheme] = useState(() => Appearance.getColorScheme());

    useEffect(() => {
        const unsubcribe = Appearance.addChangeListener(({newColorScheme}) => setColorScheme(newColorScheme)).remove;

        return unsubcribe;
    }, []);

    return colorScheme === 'light';
}

export default useIsLightMode;

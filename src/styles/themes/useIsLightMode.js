import {Appearance} from 'react-native';

function useIsLightMode() {
    return Appearance.getColorScheme() === 'light';
}

export default useIsLightMode;

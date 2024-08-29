import type {EventMapBase} from '@react-navigation/native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformSpecificEventMap, PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {CustomCodePropsWithTransformedState} from '@libs/Navigation/PlatformStackNavigation/types';

function SearchRoute({searchRoute, descriptors}: CustomCodePropsWithTransformedState<PlatformSpecificNavigationOptions, PlatformSpecificEventMap & EventMapBase>) {
    const styles = useThemeStyles();

    if (!searchRoute) {
        return null;
    }

    const key = searchRoute.key;
    const descriptor = descriptors[key];

    if (!descriptor) {
        return null;
    }

    return <View style={styles.dNone}>{descriptor.render()}</View>;
}

export default SearchRoute;

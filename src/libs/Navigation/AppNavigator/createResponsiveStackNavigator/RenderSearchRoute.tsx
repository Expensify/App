import type {EventMapBase} from '@react-navigation/native';
import {View} from 'react-native';
import type {RenderExtraContentProps} from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/types';
import type {PlatformSpecificEventMap, PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

function RenderSearchRoute<EventMap extends PlatformSpecificEventMap & EventMapBase>({
    searchRoute,
    styles,
    descriptors,
}: RenderExtraContentProps<PlatformSpecificNavigationOptions, EventMap>) {
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

export default RenderSearchRoute;

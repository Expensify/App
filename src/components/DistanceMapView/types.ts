import type {StyleProp, ViewStyle} from 'react-native';
import type {MapViewProps} from '@components/MapView/MapViewTypes';

type DistanceMapViewProps = MapViewProps & {
    overlayStyle?: StyleProp<ViewStyle>;

    /** Whether it should display the Mapbox map only when the route/coordinates exist otherwise
     * it will display pending map icon */
    requireRouteToDisplayMap?: boolean;
};

export default DistanceMapViewProps;

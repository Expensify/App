import type {StyleProp, ViewStyle} from 'react-native';
import type {MapViewProps} from '@components/MapView/MapViewTypes';

type DistanceMapViewProps = MapViewProps & {
    overlayStyle?: StyleProp<ViewStyle>;
    pendingMapContent?: React.ReactNode;
};

export default DistanceMapViewProps;

import {StyleProp, ViewStyle} from 'react-native';
import {ComponentProps} from '@components/MapView/types';

type DistanceMapViewProps = ComponentProps & {
    overlayStyle: StyleProp<ViewStyle>;
};

export default DistanceMapViewProps;

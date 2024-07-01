import type {LayoutEvent} from 'react-native';
import type GetBounds from './types';

const getBounds: GetBounds = (layoutEvent: LayoutEvent) => layoutEvent.nativeEvent.layout;

export default getBounds;

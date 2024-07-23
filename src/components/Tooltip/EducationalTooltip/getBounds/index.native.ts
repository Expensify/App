import type {LayoutChangeEvent} from 'react-native';
import type GetBounds from './types';

const getBounds: GetBounds = (event: LayoutChangeEvent) => event.nativeEvent.layout;

export default getBounds;

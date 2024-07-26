import type {LayoutChangeEvent} from 'react-native';
import type GetBounds from './types';

const getBounds: GetBounds = (event: LayoutChangeEvent) => (event.nativeEvent.target as HTMLElement).getBoundingClientRect();

export default getBounds;

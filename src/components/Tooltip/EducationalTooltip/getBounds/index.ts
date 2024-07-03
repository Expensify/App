import type {LayoutEvent} from 'react-native';
import type GetBounds from './types';

const getBounds: GetBounds = (layoutEvent: LayoutEvent) => (layoutEvent.nativeEvent.target as HTMLElement).getBoundingClientRect();

export default getBounds;

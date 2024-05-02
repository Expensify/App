import type {LayoutEvent, LayoutRectangle} from 'react-native';
import type GetBounds from './types';

const getBounds: GetBounds = (layoutEvent: LayoutEvent) => layoutEvent.nativeEvent.target.getBoundingClientRect() as LayoutRectangle;

export default getBounds;

import type GetBounds from './types';
import type {LayoutChangeEventWithTarget} from './types';

const getBounds: GetBounds = (event: LayoutChangeEventWithTarget) => event.nativeEvent.target?.getBoundingClientRect();

export default getBounds;

import type {LayoutRectangle, NativeSyntheticEvent} from 'react-native';

type LayoutChangeEventWithTarget = NativeSyntheticEvent<{layout: LayoutRectangle; target: HTMLElement}>;

type GetBounds = (event: LayoutChangeEventWithTarget) => LayoutRectangle;

export default GetBounds;
export type {LayoutChangeEventWithTarget};

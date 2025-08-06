import type {View} from 'react-native';

const viewRef = (ref: React.RefObject<View | HTMLElement | null>) => ref as React.RefObject<View | null>;

export default viewRef;

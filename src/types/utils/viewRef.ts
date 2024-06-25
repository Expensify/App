import type {View} from 'react-native';

const viewRef = (ref: React.RefObject<View | HTMLElement>) => ref as React.RefObject<View>;

export default viewRef;

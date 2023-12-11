import {View} from 'react-native';

const viewRef = (ref: React.RefObject<View | HTMLDivElement>) => ref as React.RefObject<View>;

export default viewRef;

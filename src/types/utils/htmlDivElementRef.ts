import type {View} from 'react-native';

const htmlDivElementRef = (ref: React.RefObject<View | HTMLDivElement>) => ref as React.RefObject<HTMLDivElement>;

export default htmlDivElementRef;

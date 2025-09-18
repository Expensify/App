import type {View} from 'react-native';

const htmlDivElementRef = (ref: React.RefObject<View | HTMLDivElement | null>) => ref as React.RefObject<HTMLDivElement | null>;

export default htmlDivElementRef;

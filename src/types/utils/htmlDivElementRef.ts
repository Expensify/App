import type {ComponentRef} from 'react';
import type {View} from 'react-native';

const htmlDivElementRef = (ref: React.RefObject<ComponentRef<typeof View> | HTMLDivElement | null>) => ref as React.RefObject<HTMLDivElement | null>;

export default htmlDivElementRef;

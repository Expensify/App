import type {ComponentRef} from 'react';
import type {View} from 'react-native';

const viewRef = (ref: React.RefObject<ComponentRef<typeof View> | HTMLElement | null>) => ref as React.RefObject<ComponentRef<typeof View> | null>;

export default viewRef;

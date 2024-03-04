import type {ForwardedRef} from 'react';
import type {View} from 'react-native';

const viewForwardedRef = (ref: ForwardedRef<View | HTMLDivElement>) => ref as ForwardedRef<View>;

export default viewForwardedRef;

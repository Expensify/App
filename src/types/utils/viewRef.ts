import {ForwardedRef} from 'react';
import {View} from 'react-native';

const viewRef = (ref: React.RefObject<View | HTMLDivElement>) => ref as React.RefObject<View>;

const viewForwardedRef = (ref: ForwardedRef<View | HTMLDivElement>) => ref as ForwardedRef<View>;

export {viewRef, viewForwardedRef};

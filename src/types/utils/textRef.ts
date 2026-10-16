import type {ComponentRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text} from 'react-native';

const textRef = (ref: React.RefObject<ComponentRef<typeof Text> | HTMLElement | null>) => ref as React.RefObject<ComponentRef<typeof Text> | null>;

export default textRef;

// eslint-disable-next-line no-restricted-imports
import type {Text} from 'react-native';

const textRef = (ref: React.RefObject<Text | HTMLElement | null>) => ref as React.RefObject<Text | null>;

export default textRef;

// eslint-disable-next-line no-restricted-imports
import type {Text} from 'react-native';

const textRef = (ref: React.RefObject<Text | HTMLDivElement>) => ref as React.RefObject<Text>;

export default textRef;

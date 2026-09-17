import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

/** Bar-level configuration for the composed `<Header>` (content lives in the child blocks). */
type HeaderProps = {
    /** The composed content of the header: primitive blocks and the `Header.Right` zone. */
    children: ReactNode;

    /** Additional styles to add to the outer header bar. */
    style?: StyleProp<ViewStyle>;
};

export default HeaderProps;

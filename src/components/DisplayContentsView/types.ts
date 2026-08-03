import type {PropsWithChildren} from 'react';
import type {ViewStyle} from 'react-native';

type DisplayContentsViewProps = PropsWithChildren<{
    /** Optional styles applied to the wrapper view */
    style?: ViewStyle;
}>;

export default DisplayContentsViewProps;

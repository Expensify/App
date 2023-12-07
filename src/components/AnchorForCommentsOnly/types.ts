import {StyleProp, TextStyle} from 'react-native';
import ChildrenProps from '@src/types/utils/ChildrenProps';

type AnchorForCommentsOnlyProps = ChildrenProps & {
    /** The URL to open */
    href?: string;

    /** What headers to send to the linked page (usually noopener and noreferrer)
     This is unused in native, but is here for parity with web */
    rel?: string;

    /** Used to determine where to open a link ("_blank" is passed for a new tab)
     This is unused in native, but is here for parity with web */
    target?: string;

    /** Any additional styles to apply */
    style: StyleProp<TextStyle>;

    /** Press handler for the link, when not passed, default href is used to create a link like behaviour */
    onPress?: () => Promise<void> | void;
};

export default AnchorForCommentsOnlyProps;

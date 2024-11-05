import type {StyleProp, TextStyle} from 'react-native';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

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
    onPress?: () => void;

    /** Indicates whether an image is wrapped in an anchor (`<a>`) tag with an `href` link */
    isLinkHasImage?: boolean;
};

type BaseAnchorForCommentsOnlyProps = AnchorForCommentsOnlyProps & {
    /** Press in handler for the link */
    onPressIn?: () => void;

    /** Press out handler for the link */
    onPressOut?: () => void;
};

type LinkProps = {
    /** Press handler for the link, when not passed, default href is used to create a link like behaviour */
    onPress?: () => void;

    /** The URL to open */
    href?: string;
};

export type {AnchorForCommentsOnlyProps, BaseAnchorForCommentsOnlyProps, LinkProps};

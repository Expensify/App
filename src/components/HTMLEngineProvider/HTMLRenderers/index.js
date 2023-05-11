import AnchorRenderer from './AnchorRenderer';
import CodeRenderer from './CodeRenderer';
import EditedRenderer from './EditedRenderer';
import MentionHereRenderer from './MentionHereRenderer';
import ImageRenderer from './ImageRenderer';
import MentionUserRenderer from './MentionUserRenderer';
import PreRenderer from './PreRenderer';

/**
 * This collection defines our custom renderers. It is a mapping from HTML tag type to the corresponding component.
 */
export default {
    // Standard HTML tag renderers
    a: AnchorRenderer,
    code: CodeRenderer,
    img: ImageRenderer,

    // Custom tag renderers
    edited: EditedRenderer,
    pre: PreRenderer,
    'mention-user': MentionUserRenderer,
    'mention-here': MentionHereRenderer,
};

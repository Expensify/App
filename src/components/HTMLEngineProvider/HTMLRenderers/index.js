import AnchorRenderer from './AnchorRenderer';
import CodeRenderer from './CodeRenderer';
import EditedRenderer from './EditedRenderer';
import ImageRenderer from './ImageRenderer';
import PreRenderer from './PreRenderer';

/**
 * This collection defines our custom renderers. It is a mapping from HTML tag type to the corresponding component.
 */
export default {
    // Standard HTML tag renderers
    a: AnchorRenderer,
    code: CodeRenderer,
    img: ImageRenderer,
    pre: PreRenderer,

    // Custom tag renderers
    edited: EditedRenderer,
};

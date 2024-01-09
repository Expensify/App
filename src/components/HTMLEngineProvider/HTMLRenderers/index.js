import AnchorRenderer from './AnchorRenderer';
import CodeRenderer from './CodeRenderer';
import EditedRenderer from './EditedRenderer';
import ImageRenderer from './ImageRenderer';
import MentionHereRenderer from './MentionHereRenderer';
import MentionUserRenderer from './MentionUserRenderer';
import NextStepEmailRenderer from './NextStepEmailRenderer';
import PreRenderer from './PreRenderer';

/**
 * This collection defines our custom renderers. It is a mapping from HTML tag type to the corresponding component.
 */
export default {
    // Standard HTML tag renderers
    a: AnchorRenderer,
    code: CodeRenderer,
    img: ImageRenderer,
    video: AnchorRenderer, // temporary until we have a video player component

    // Custom tag renderers
    edited: EditedRenderer,
    pre: PreRenderer,
    'mention-user': MentionUserRenderer,
    'mention-here': MentionHereRenderer,
    'next-step-email': NextStepEmailRenderer,
};

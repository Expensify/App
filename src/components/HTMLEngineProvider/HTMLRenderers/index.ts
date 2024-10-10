import type {CustomTagRendererRecord} from 'react-native-render-html';
import AnchorRenderer from './AnchorRenderer';
import CodeRenderer from './CodeRenderer';
import EditedRenderer from './EditedRenderer';
import EmojiRenderer from './EmojiRenderer';
import MentionHereRenderer from './MentionHereRenderer';
import MentionReportRenderer from './MentionReportRenderer';
import MentionUserRenderer from './MentionUserRenderer';
import NextStepEmailRenderer from './NextStepEmailRenderer';
import PreRenderer from './PreRenderer';
import VideoRenderer from './VideoRenderer';
import ImageRendererWrapper from "./ImageRendererWrapper";

/**
 * This collection defines our custom renderers. It is a mapping from HTML tag type to the corresponding component.
 */
const HTMLEngineProviderComponentList: CustomTagRendererRecord = {
    // Standard HTML tag renderers
    a: AnchorRenderer,
    code: CodeRenderer,
    img: ImageRendererWrapper,
    video: VideoRenderer,

    // Custom tag renderers
    edited: EditedRenderer,
    pre: PreRenderer,
    /* eslint-disable @typescript-eslint/naming-convention */
    'mention-user': MentionUserRenderer,
    'mention-report': MentionReportRenderer,
    'mention-here': MentionHereRenderer,
    emoji: EmojiRenderer,
    'next-step-email': NextStepEmailRenderer,
    /* eslint-enable @typescript-eslint/naming-convention */
};

export default HTMLEngineProviderComponentList;

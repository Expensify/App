import type {CustomTagRendererRecord} from 'react-native-render-html';
import AccountManagerLinkRenderer from './AccountManagerLinkRenderer';
import AnchorRenderer from './AnchorRenderer';
import CodeRenderer from './CodeRenderer';
import ConciergeLinkRenderer from './ConciergeLinkRenderer';
import CopyTextRenderer from './CopyTextRenderer';
import DeletedActionRenderer from './DeletedActionRenderer';
import EditedRenderer from './EditedRenderer';
import EmojiRenderer from './EmojiRenderer';
import ImageRenderer from './ImageRenderer';
import MentionHereRenderer from './MentionHereRenderer';
import MentionReportRenderer from './MentionReportRenderer';
import MentionUserRenderer from './MentionUserRenderer';
import NextStepEmailRenderer from './NextStepEmailRenderer';
import PreRenderer from './PreRenderer';
import RBRRenderer from './RBRRenderer';
import ShortMentionRenderer from './ShortMentionRenderer';
import TaskTitleRenderer from './TaskTitleRenderer';
import VideoRenderer from './VideoRenderer';

/**
 * This collection defines our custom renderers. It is a mapping from HTML tag type to the corresponding component.
 */
const HTMLEngineProviderComponentList: CustomTagRendererRecord = {
    // Standard HTML tag renderers
    a: AnchorRenderer,
    code: CodeRenderer,
    img: ImageRenderer,
    video: VideoRenderer,

    // Custom tag renderers
    edited: EditedRenderer,
    pre: PreRenderer,
    /* eslint-disable @typescript-eslint/naming-convention */
    'task-title': TaskTitleRenderer,
    rbr: RBRRenderer,
    'mention-user': MentionUserRenderer,
    'mention-report': MentionReportRenderer,
    'mention-here': MentionHereRenderer,
    'mention-short': ShortMentionRenderer,
    'copy-text': CopyTextRenderer,
    emoji: EmojiRenderer,
    'next-step-email': NextStepEmailRenderer,
    'deleted-action': DeletedActionRenderer,
    'concierge-link': ConciergeLinkRenderer,
    'account-manager-link': AccountManagerLinkRenderer,
    /* eslint-enable @typescript-eslint/naming-convention */
};

export default HTMLEngineProviderComponentList;

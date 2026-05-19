import type {CustomTagRendererRecord} from 'react-native-render-html';
import AccountManagerLinkRenderer from './AccountManagerLinkRenderer';
import AnchorRenderer from './AnchorRenderer';
import BulletItemRenderer from './BulletItemRenderer';
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
import OLRenderer from './OLRenderer';
import PreRenderer from './PreRenderer';
import RBRRenderer from './RBRRenderer';
import ShortMentionRenderer from './ShortMentionRenderer';
import SparklesIconRenderer from './SparklesIconRenderer';
import TaskTitleRenderer from './TaskTitleRenderer';
import TransactionHistoryLinkRenderer from './TransactionHistoryLinkRenderer';
import ULRenderer from './ULRenderer';
import UserDetailsRenderer from './UserDetailsRenderer';
import VideoRenderer from './VideoRenderer';

/**
 * This collection defines our custom renderers. It is a mapping from HTML tag type to the corresponding component.
 */
export default (): CustomTagRendererRecord => ({
    // Standard HTML tag renderers
    a: AnchorRenderer,
    code: CodeRenderer,
    img: ImageRenderer,
    ol: OLRenderer,
    ul: ULRenderer,
    video: VideoRenderer,

    // Custom tag renderers
    edited: EditedRenderer,
    pre: PreRenderer,
    /* eslint-disable @typescript-eslint/naming-convention */
    'bullet-item': BulletItemRenderer,
    'task-title': TaskTitleRenderer,
    rbr: RBRRenderer,
    'mention-user': MentionUserRenderer,
    'mention-report': MentionReportRenderer,
    'mention-here': MentionHereRenderer,
    'mention-short': ShortMentionRenderer,
    'user-details': UserDetailsRenderer,
    'copy-text': CopyTextRenderer,
    emoji: EmojiRenderer,
    'next-step-email': NextStepEmailRenderer,
    'deleted-action': DeletedActionRenderer,
    'concierge-link': ConciergeLinkRenderer,
    'transaction-history-link': TransactionHistoryLinkRenderer,
    'account-manager-link': AccountManagerLinkRenderer,
    'sparkles-icon': SparklesIconRenderer,
    /* eslint-enable @typescript-eslint/naming-convention */

    // VictoryChart components depend on Skia and should be loaded after Skia WASM
    //
    // Using `require` loads the components only when this function is executed,
    // unlike `import` they'd be imported on module execution BEFORE Skia WASM is loaded.
    victorychart: require('./VictoryChartRenderer').default,
});

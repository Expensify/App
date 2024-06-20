import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type {ReactionListAnchor, ReactionListEvent} from '@pages/home/ReportScreenContext';
import type {AnchorPosition} from '@src/styles';
import type {ReportActionReactions} from '@src/types/onyx';

type BasePopoverReactionListOnyxProps = {
    /** The reactions for the report action */
    emojiReactions: OnyxEntry<ReportActionReactions>;
};

type BasePopoverReactionListProps = {
    /** The ID of the report action */
    reportActionID: string;

    /** The emoji name */
    emojiName: string;
};

type BasePopoverReactionListHookProps = BasePopoverReactionListProps & {
    /** The reactions for the report action */
    emojiReactions: OnyxEntry<ReportActionReactions>;

    /** The current user's account ID */
    accountID: WithCurrentUserPersonalDetailsProps['currentUserPersonalDetails']['accountID'];

    preferredLocale: LocaleContextProps['preferredLocale'];
};

type BasePopoverReactionListPropsWithLocalWithOnyx = WithCurrentUserPersonalDetailsProps & BasePopoverReactionListOnyxProps & BasePopoverReactionListProps;
type BasePopoverReactionListState = {
    /** Whether the popover is visible */
    isPopoverVisible: boolean;

    /** The horizontal and vertical position (relative to the screen) where the popover will display. */
    popoverAnchorPosition: AnchorPosition;

    /** The horizontal and vertical position (relative to the screen) where the cursor is. */
    cursorRelativePosition: AnchorPosition;
};

type ShowReactionList = (event: ReactionListEvent | undefined, reactionListAnchor: ReactionListAnchor) => void;

type InnerReactionListRef = {
    showReactionList: ShowReactionList;
    hideReactionList: () => void;
    isActiveReportAction: (actionID: number | string) => boolean;
};

export type {
    BasePopoverReactionListProps,
    BasePopoverReactionListHookProps,
    BasePopoverReactionListPropsWithLocalWithOnyx,
    BasePopoverReactionListState,
    BasePopoverReactionListOnyxProps,
    ShowReactionList,
    ReactionListAnchor,
    InnerReactionListRef,
};

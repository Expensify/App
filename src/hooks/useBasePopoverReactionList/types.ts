import type {ForwardedRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type {ReactionListAnchor, ReactionListEvent, ReactionListRef} from '@pages/inbox/ReportScreenContext';
import type {ReportActionReactions} from '@src/types/onyx';

type BasePopoverReactionListProps = {
    /** The ID of the report action */
    reportActionID: string;

    /** The emoji name */
    emojiName: string;

    /** Reference to the outer element */
    ref: ForwardedRef<Partial<ReactionListRef>>;
};

type BasePopoverReactionListHookProps = Omit<BasePopoverReactionListProps, 'ref'> & {
    /** The reactions for the report action */
    emojiReactions: OnyxEntry<ReportActionReactions>;

    /** The current user's account ID */
    accountID: WithCurrentUserPersonalDetailsProps['currentUserPersonalDetails']['accountID'];

    preferredLocale: LocaleContextProps['preferredLocale'];
};

type ShowReactionList = (event: ReactionListEvent | undefined, reactionListAnchor: ReactionListAnchor) => void;

type InnerReactionListRef = {
    showReactionList: ShowReactionList;
    hideReactionList: () => void;
    isActiveReportAction: (actionID: number | string) => boolean;
};

export type {BasePopoverReactionListHookProps, BasePopoverReactionListProps, ShowReactionList, ReactionListAnchor, InnerReactionListRef};

import type {RefObject, SyntheticEvent} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text, View} from 'react-native';

import {createContext} from 'react';

type ReactionListAnchor = View | Text | HTMLDivElement | null;

type ReactionListEvent = GestureResponderEvent | MouseEvent | SyntheticEvent<ReactionListAnchor, MouseEvent>;

type ReactionListContextType = {
    showReactionList: (event: ReactionListEvent | undefined, reactionListAnchor: ReactionListAnchor, emojiName: string, reportActionID: string) => void;
    hideReactionList: () => void;
    isActiveReportAction: (reportActionID: number | string) => boolean;
};

const ReactionListContext = createContext<ReactionListContextType>({
    showReactionList: () => {},
    hideReactionList: () => {},
    isActiveReportAction: () => false,
});

export {ReactionListContext};
export type {ReactionListContextType, ReactionListAnchor, ReactionListEvent};

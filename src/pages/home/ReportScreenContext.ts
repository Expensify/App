import {createContext, RefObject} from 'react';
import {FlatList, GestureResponderEvent} from 'react-native';

type ReactionListRef = {
    showReactionList: (event: GestureResponderEvent | undefined, reactionListAnchor: Element, emojiName: string, reportActionID: string) => void;
    hideReactionList: () => void;
    isActiveReportAction: (actionID: number | string) => boolean;
};

type ActionListContextType = RefObject<FlatList<unknown>> | null;
type ReactionListContextType = RefObject<ReactionListRef> | null;

const ActionListContext = createContext<ActionListContextType>(null);
const ReactionListContext = createContext<ReactionListContextType>(null);

export {ActionListContext, ReactionListContext};
export type {ReactionListRef, ActionListContextType, ReactionListContextType};

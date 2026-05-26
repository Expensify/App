import type {RefObject} from 'react';
import type {View} from 'react-native';
import createContextNamespace from '@hooks/createContextNamespace';

type FocusableItem = {
    ref: RefObject<View | null>;
    isDisabled: boolean;
    onActivate: () => void;
    text?: string;
};

type ContentNavigation = {
    currentSubID: string | null;
    isAncestorOfCurrent: (subID: string) => boolean;
};

// Split from navigation so focus changes don't re-render navigation-only consumers.
type ContentFocus = {
    focusedID: string | null;
};

type ContentSubActions = {
    enterSub: (id: string) => void;
    /** `null` pops to root. */
    exitSub: (target?: string | null) => void;
    registerSub: (subID: string) => void;
    /** Pops to the nearest still-mounted ancestor when an active sub unmounts. */
    unregisterSub: (subID: string) => void;
};

type ContentItemActions = {
    registerItem: (id: string, item: FocusableItem) => void;
    unregisterItem: (id: string) => void;
    setFocusedID: (id: string | null) => void;
};

/** Closes and resets sub-navigation + focus state. */
type ContentClose = () => void;

const createContentContext = createContextNamespace('PopoverMenu.Content');

const [ContentNavigationContext, useContentNavigation] = createContentContext<ContentNavigation>('Navigation');
const [ContentFocusContext, useContentFocus] = createContentContext<ContentFocus>('Focus');
const [ContentSubActionsContext, useContentSubActions] = createContentContext<ContentSubActions>('SubActions');
const [ContentItemActionsContext, useContentItemActions] = createContentContext<ContentItemActions>('ItemActions');
const [ContentCloseContext, useContentClose] = createContentContext<ContentClose>('Close');

export {
    ContentNavigationContext,
    ContentFocusContext,
    ContentSubActionsContext,
    ContentItemActionsContext,
    ContentCloseContext,
    useContentNavigation,
    useContentFocus,
    useContentSubActions,
    useContentItemActions,
    useContentClose,
};
export type {ContentNavigation, ContentFocus, ContentSubActions, ContentItemActions, ContentClose, FocusableItem};

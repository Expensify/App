import {createContext} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import useAssertedContext from '@hooks/useAssertedContext';

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

const PARENT = '<PopoverMenu.Content>';

const ContentNavigationContext = createContext<ContentNavigation | null>(null);
ContentNavigationContext.displayName = 'PopoverMenuContentNavigationContext';

const ContentFocusContext = createContext<ContentFocus | null>(null);
ContentFocusContext.displayName = 'PopoverMenuContentFocusContext';

const ContentSubActionsContext = createContext<ContentSubActions | null>(null);
ContentSubActionsContext.displayName = 'PopoverMenuContentSubActionsContext';

const ContentItemActionsContext = createContext<ContentItemActions | null>(null);
ContentItemActionsContext.displayName = 'PopoverMenuContentItemActionsContext';

const ContentCloseContext = createContext<ContentClose | null>(null);
ContentCloseContext.displayName = 'PopoverMenuContentCloseContext';

const useContentNavigation = (consumerName: string) => useAssertedContext(ContentNavigationContext, consumerName, PARENT);
const useContentFocus = (consumerName: string) => useAssertedContext(ContentFocusContext, consumerName, PARENT);
const useContentSubActions = (consumerName: string) => useAssertedContext(ContentSubActionsContext, consumerName, PARENT);
const useContentItemActions = (consumerName: string) => useAssertedContext(ContentItemActionsContext, consumerName, PARENT);
const useContentClose = (consumerName: string) => useAssertedContext(ContentCloseContext, consumerName, PARENT);

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

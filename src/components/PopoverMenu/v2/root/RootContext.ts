import {createContext} from 'react';
import type {Dispatch, RefObject, SetStateAction} from 'react';
import type {View} from 'react-native';
import useAssertedContext from '@hooks/useAssertedContext';

type AnchorRef = RefObject<View | null>;

type AnchorRect = {x: number; y: number; width: number; height: number};

type ActiveAnchor = {
    ref: AnchorRef;
    rect: AnchorRect;
};

type RootVisibility = {isVisible: boolean};

type RootMeta = {
    activeAnchor: ActiveAnchor | null;
    /** Stable id linking Trigger ↔ Content for `accessibilityLabelledBy` / `aria-controls`. */
    triggerID: string;
    /** Stable id on Content's surface so triggers can advertise `aria-controls`. */
    contentID: string;
};

type RootActions = {
    setIsVisible: Dispatch<SetStateAction<boolean>>;
    /** Never-null: reset happens via `setIsVisible(false)` and the next press overwrites. */
    setActiveAnchor: (anchor: ActiveAnchor) => void;
};

const PARENT = '<PopoverMenu.Root>';

const RootVisibilityContext = createContext<RootVisibility | null>(null);
RootVisibilityContext.displayName = 'PopoverMenuRootVisibilityContext';

const RootMetaContext = createContext<RootMeta | null>(null);
RootMetaContext.displayName = 'PopoverMenuRootMetaContext';

const RootActionsContext = createContext<RootActions | null>(null);
RootActionsContext.displayName = 'PopoverMenuRootActionsContext';

const useRootVisibility = (consumerName: string) => useAssertedContext(RootVisibilityContext, consumerName, PARENT);
const useRootMeta = (consumerName: string) => useAssertedContext(RootMetaContext, consumerName, PARENT);
const useRootActions = (consumerName: string) => useAssertedContext(RootActionsContext, consumerName, PARENT);

export {RootVisibilityContext, RootMetaContext, RootActionsContext, useRootVisibility, useRootMeta, useRootActions};
export type {ActiveAnchor, AnchorRect, AnchorRef, RootVisibility, RootMeta, RootActions};

import {createContext, use} from 'react';
import type {Dispatch, RefObject, SetStateAction} from 'react';
import type {View} from 'react-native';

type AnchorRef = RefObject<View | null>;

type AnchorRect = {x: number; y: number; width: number; height: number};

// Ref + rect captured together so the popover never sees a half-updated anchor.
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
    /** Narrowed to never-null: only `useAnchorOpener` writes; reset happens via `setIsVisible(false)` and the next press overwrites. */
    setActiveAnchor: (anchor: ActiveAnchor) => void;
};

const RootVisibilityContext = createContext<RootVisibility | null>(null);
RootVisibilityContext.displayName = 'PopoverMenuRootVisibilityContext';

const RootMetaContext = createContext<RootMeta | null>(null);
RootMetaContext.displayName = 'PopoverMenuRootMetaContext';

const RootActionsContext = createContext<RootActions | null>(null);
RootActionsContext.displayName = 'PopoverMenuRootActionsContext';

function useRootVisibility(componentName: string): RootVisibility {
    const value = use(RootVisibilityContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Root>.`);
    }
    return value;
}

function useRootMeta(componentName: string): RootMeta {
    const value = use(RootMetaContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Root>.`);
    }
    return value;
}

function useRootActions(componentName: string): RootActions {
    const value = use(RootActionsContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Root>.`);
    }
    return value;
}

export {RootVisibilityContext, RootMetaContext, RootActionsContext, useRootVisibility, useRootMeta, useRootActions};
export type {ActiveAnchor, AnchorRect, AnchorRef, RootVisibility, RootMeta, RootActions};

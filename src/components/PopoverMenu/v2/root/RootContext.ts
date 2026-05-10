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

type RootState = {
    state: {isVisible: boolean};
    meta: {
        activeAnchor: ActiveAnchor | null;
    };
};

type RootActions = {
    setIsVisible: Dispatch<SetStateAction<boolean>>;
    setActiveAnchor: (anchor: ActiveAnchor) => void;
};

const RootStateContext = createContext<RootState | null>(null);
RootStateContext.displayName = 'PopoverMenuRootStateContext';

const RootActionsContext = createContext<RootActions | null>(null);
RootActionsContext.displayName = 'PopoverMenuRootActionsContext';

function useRootState(componentName: string): RootState {
    const value = use(RootStateContext);
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

export {RootStateContext, RootActionsContext, useRootState, useRootActions};
export type {ActiveAnchor, AnchorRect, AnchorRef, RootState, RootActions};

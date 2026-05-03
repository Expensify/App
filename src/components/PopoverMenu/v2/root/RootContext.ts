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

type RootStateValue = {
    state: {isVisible: boolean};
    meta: {activeAnchor: ActiveAnchor | null};
};

type RootActionsValue = {
    setIsVisible: Dispatch<SetStateAction<boolean>>;
    setActiveAnchor: (anchor: ActiveAnchor) => void;
};

const RootStateContext = createContext<RootStateValue | null>(null);
RootStateContext.displayName = 'PopoverMenuRootStateContext';

const RootActionsContext = createContext<RootActionsValue | null>(null);
RootActionsContext.displayName = 'PopoverMenuRootActionsContext';

function useRootState(componentName: string): RootStateValue {
    const value = use(RootStateContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Root>.`);
    }
    return value;
}

function useRootActions(componentName: string): RootActionsValue {
    const value = use(RootActionsContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Root>.`);
    }
    return value;
}

export {RootStateContext, RootActionsContext, useRootState, useRootActions};
export type {ActiveAnchor, AnchorRect, AnchorRef, RootStateValue, RootActionsValue};

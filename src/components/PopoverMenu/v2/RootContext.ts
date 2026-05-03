import {createContext, use} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import type {MeasurableRef} from '@hooks/usePopoverPosition';

type AnchorRef = MeasurableRef;

type RootStateValue = {
    state: {isVisible: boolean};
    meta: {anchorRef: AnchorRef};
};

type RootActionsValue = {
    setIsVisible: Dispatch<SetStateAction<boolean>>;
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
export type {AnchorRef, RootStateValue, RootActionsValue};

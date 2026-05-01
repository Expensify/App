import {createContext, use} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import type PopoverProps from '@components/Popover/types';

type AnchorRef = PopoverProps['anchorRef'];

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

function useRootState(): RootStateValue {
    const value = use(RootStateContext);
    if (!value) {
        throw new Error('PopoverMenu hook used outside <PopoverMenu.Root>');
    }
    return value;
}

function useRootActions(): RootActionsValue {
    const value = use(RootActionsContext);
    if (!value) {
        throw new Error('PopoverMenu hook used outside <PopoverMenu.Root>');
    }
    return value;
}

export {RootStateContext, RootActionsContext, useRootState, useRootActions};
export type {AnchorRef, RootStateValue, RootActionsValue};

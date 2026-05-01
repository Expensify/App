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

function useRootState(consumerName = 'usePopoverMenuRootState'): RootStateValue {
    const value = use(RootStateContext);
    if (!value) {
        throw new Error(`\`${consumerName}\` must be called inside <PopoverMenu.Root>`);
    }
    return value;
}

function useRootActions(consumerName = 'usePopoverMenuRootActions'): RootActionsValue {
    const value = use(RootActionsContext);
    if (!value) {
        throw new Error(`\`${consumerName}\` must be called inside <PopoverMenu.Root>`);
    }
    return value;
}

export {RootStateContext, RootActionsContext, useRootState, useRootActions};
export type {AnchorRef, RootStateValue, RootActionsValue};

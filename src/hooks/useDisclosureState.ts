import {useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import useControlledState from './useControlledState';

type UseDisclosureStateProps = {
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
};

type DisclosureState = {
    readonly isOpen: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    open: () => void;
    close: () => void;
    toggle: () => void;
};

function useDisclosureState({isOpen: controlled, defaultOpen = false, onOpenChange}: UseDisclosureStateProps): DisclosureState {
    const [isOpen, setOpen] = useControlledState(controlled, defaultOpen, onOpenChange);
    const [actions] = useState(() => ({
        open: () => setOpen(true),
        close: () => setOpen(false),
        toggle: () => setOpen((previous) => !previous),
    }));
    return {isOpen, setOpen, ...actions};
}

export default useDisclosureState;

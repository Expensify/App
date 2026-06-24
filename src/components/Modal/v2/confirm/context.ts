import {createContext, use} from 'react';

type ConfirmState = {
    readonly isOpen: boolean;
};

type ConfirmActions = {
    readonly confirm: () => void;
    readonly cancel: () => void;
};

type ConfirmContextValue = {
    readonly state: ConfirmState;
    readonly actions: ConfirmActions;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

function useConfirm(consumerName: string): ConfirmContextValue {
    const value = use(ConfirmContext);
    if (!value) {
        throw new Error(`${consumerName} must be rendered inside <Confirm.Root>`);
    }
    return value;
}

export {ConfirmContext, useConfirm};
export type {ConfirmActions, ConfirmContextValue, ConfirmState};

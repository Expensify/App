import type {PINActionsContextType, PINStateContextType} from './types.context';

const defaultPINStateContextValue: PINStateContextType = {
    PIN: '',
    isConfirmStep: false,
    isPINHidden: true,
};

const defaultPINActionsContextValue: PINActionsContextType = {
    setPIN: () => {},
    clearPIN: () => {},
    setIsConfirmStep: () => {},
    togglePINVisibility: () => {},
};

export {defaultPINStateContextValue, defaultPINActionsContextValue};

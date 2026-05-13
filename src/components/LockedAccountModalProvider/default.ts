import type {LockedAccountActionsContextType, LockedAccountStateContextType} from './types';

const defaultLockedAccountStateContextValue: LockedAccountStateContextType = {
    isAccountLocked: false,
};

const defaultLockedAccountActionsContextValue: LockedAccountActionsContextType = {
    showLockedAccountModal: () => {},
};

export {defaultLockedAccountStateContextValue, defaultLockedAccountActionsContextValue};

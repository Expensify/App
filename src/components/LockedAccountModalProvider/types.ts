type LockedAccountStateContextType = {
    isAccountLocked: boolean;
};

type LockedAccountActionsContextType = {
    showLockedAccountModal: () => void;
};

export type {LockedAccountStateContextType, LockedAccountActionsContextType};

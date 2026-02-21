type DelegateNoAccessStateContextType = {
    /** Whether the current user is acting as delegate */
    isActingAsDelegate: boolean;

    /** Whether the current user has restricted access as a submitter only delegate */
    isDelegateAccessRestricted: boolean;
};

type DelegateNoAccessActionsContextType = {
    /** Function to show the delegate no access modal */
    showDelegateNoAccessModal: () => void;
};

export type {DelegateNoAccessStateContextType, DelegateNoAccessActionsContextType};

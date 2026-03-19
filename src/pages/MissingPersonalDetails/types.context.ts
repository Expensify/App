type PINStateContextType = {
    /** The current PIN value */
    PIN: string;

    /** Whether the user is on the PIN confirmation step */
    isConfirmStep: boolean;

    /** Whether the PIN input is hidden */
    isPINHidden: boolean;
};

type PINActionsContextType = {
    /** Set the PIN value */
    setPIN: (PIN: string) => void;

    /** Clear the PIN and reset verification status */
    clearPIN: () => void;

    /** Set whether the user is on the PIN confirmation step */
    setIsConfirmStep: (isConfirmStep: boolean) => void;

    /** Toggle PIN visibility */
    togglePINVisibility: () => void;
};

export type {PINStateContextType, PINActionsContextType};

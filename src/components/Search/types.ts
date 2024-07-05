/** Model of the selected transaction */
type SelectedTransactionInfo = {
    /** Whether the transaction is selected */
    isSelected: boolean;

    /** If the transaction can be deleted */
    canDelete: boolean;

    /** The action that can be performed for the transaction */
    action: string;
};

/** Model of selected results */
type SelectedTransactions = Record<string, SelectedTransactionInfo>;

// eslint-disable-next-line import/prefer-default-export
export type {SelectedTransactionInfo, SelectedTransactions};

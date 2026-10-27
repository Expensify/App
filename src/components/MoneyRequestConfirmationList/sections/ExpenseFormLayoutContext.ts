import type {ReactNode} from 'react';

import {createContext, useContext} from 'react';

type ExpenseFormLayoutContextValue = {
    /**
     * Whether a selectable field renders as one of the form's bordered rows with a down caret, instead of as a
     * borderless push row. Every create-expense form asks for the bordered treatment.
     */
    shouldUseDropdownRows: boolean;

    /**
     * Rendered beside the amount field, vertically aligned with it. Every form that offers a receipt from the
     * field row rather than from a full-width empty state puts its compact add-receipt button here, which is how
     * the amount field stays unaware that the button exists.
     */
    amountTrailingAction?: ReactNode;
};

const defaultExpenseFormLayout: ExpenseFormLayoutContextValue = {shouldUseDropdownRows: false};

const dropdownRowsExpenseFormLayout: ExpenseFormLayoutContextValue = {shouldUseDropdownRows: true};

const ExpenseFormLayoutContext = createContext<ExpenseFormLayoutContextValue>(defaultExpenseFormLayout);

function useExpenseFormLayout(): ExpenseFormLayoutContextValue {
    return useContext(ExpenseFormLayoutContext);
}

export default ExpenseFormLayoutContext;
export {dropdownRowsExpenseFormLayout, useExpenseFormLayout};
export type {ExpenseFormLayoutContextValue};

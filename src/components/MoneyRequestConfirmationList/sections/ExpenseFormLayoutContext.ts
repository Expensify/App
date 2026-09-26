import type {ReactNode} from 'react';

import {createContext, useContext} from 'react';

/**
 * How the confirmation form presents its fields. The footer variant that wants a presentation provides it, so a
 * field reads the decision straight off the context instead of being handed it by every component that sits
 * between it and the footer.
 */
type ExpenseFormLayoutContextValue = {
    /**
     * Whether a selectable field renders as one of the form's bordered rows with a down caret, instead of as a
     * borderless push row. Only the manual expense form asks for the bordered treatment.
     */
    shouldUseDropdownRows: boolean;

    /**
     * Rendered beside the amount field, vertically aligned with it. Every form that offers a receipt from the
     * field row rather than from a full-width empty state puts its compact add-receipt button here, which is how
     * the amount field stays unaware that the button exists.
     */
    amountTrailingAction?: ReactNode;
};

/** Push rows and no trailing action: what a footer that asks for nothing renders. */
const defaultExpenseFormLayout: ExpenseFormLayoutContextValue = {shouldUseDropdownRows: false};

/**
 * The bordered-row presentation, shared by every footer that wants it and nothing more. A module-level constant
 * rather than a literal per render, so providing it never re-renders the whole field tree for a new identity. The
 * footers that also offer the compact add-receipt button build their own value through `useAddReceiptLayout`,
 * since they fill the amount field's trailing slot as well.
 */
const dropdownRowsExpenseFormLayout: ExpenseFormLayoutContextValue = {shouldUseDropdownRows: true};

const ExpenseFormLayoutContext = createContext<ExpenseFormLayoutContextValue>(defaultExpenseFormLayout);

function useExpenseFormLayout(): ExpenseFormLayoutContextValue {
    return useContext(ExpenseFormLayoutContext);
}

export default ExpenseFormLayoutContext;
export {dropdownRowsExpenseFormLayout, useExpenseFormLayout};
export type {ExpenseFormLayoutContextValue};

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
     * Rendered beside the amount field, vertically aligned with it. The manual form puts its compact add-receipt
     * button here, which is how the amount field stays unaware that the button exists.
     */
    amountTrailingAction?: ReactNode;
};

/** Push rows and no trailing action: what every footer other than the manual one renders. */
const defaultExpenseFormLayout: ExpenseFormLayoutContextValue = {shouldUseDropdownRows: false};

const ExpenseFormLayoutContext = createContext<ExpenseFormLayoutContextValue>(defaultExpenseFormLayout);

function useExpenseFormLayout(): ExpenseFormLayoutContextValue {
    return useContext(ExpenseFormLayoutContext);
}

export default ExpenseFormLayoutContext;
export {useExpenseFormLayout};

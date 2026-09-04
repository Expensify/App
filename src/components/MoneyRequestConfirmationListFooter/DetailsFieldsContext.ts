import {createContext, useContext} from 'react';

import type {FieldVisibility} from './fieldGroups/fieldVisibility';

type DetailsFieldsContextValue = {
    /** Per-field visibility decisions resolved by `computeFieldVisibility` */
    fieldVisibility: Pick<FieldVisibility, 'amount' | 'distance' | 'rate' | 'merchant' | 'time'>;

    /** When true, suppresses the below-show-more entries (Amount, Rate, Merchant, Time) */
    isCompactMode: boolean;

    /** ISO currency code for the transaction */
    iouCurrencyCode: string;

    /** Whether navigating to upgrade is required to proceed past blocked workspaces */
    shouldNavigateToUpgradePath: boolean;

    /** Whether the user must select a policy before submitting */
    shouldSelectPolicy: boolean;
};

const DetailsFieldsContext = createContext<DetailsFieldsContextValue | null>(null);

function useDetailsFields(): DetailsFieldsContextValue {
    const value = useContext(DetailsFieldsContext);
    if (!value) {
        throw new Error('Details fields must be rendered as a child of <ConfirmationFieldList>');
    }
    return value;
}

export default DetailsFieldsContext;
export {useDetailsFields};

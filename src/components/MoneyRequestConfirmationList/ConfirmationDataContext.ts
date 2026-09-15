import {createContext, useContext} from 'react';

import type useConfirmationListData from './hooks/useConfirmationListData';

/** Everything the shared data hook resolved for the expense being confirmed. */
type ConfirmationData = ReturnType<typeof useConfirmationListData>;

const ConfirmationDataContext = createContext<ConfirmationData | undefined>(undefined);

/**
 * Reads the resolved confirmation data. The side-effect controllers use this instead of taking the same twenty-odd
 * values as props from every list variant.
 */
function useConfirmationData() {
    const value = useContext(ConfirmationDataContext);
    if (!value) {
        throw new Error('useConfirmationData must be called inside a ConfirmationDataContext provider');
    }
    return value;
}

export default ConfirmationDataContext;
export {useConfirmationData};
export type {ConfirmationData};

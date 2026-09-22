import {clearAddPaymentCardDraftCurrency} from '@userActions/PaymentMethods';

import {useEffect, useState} from 'react';

/**
 * Clears the add-card draft currency once per mount and reports when that has taken effect. Re-running it would discard
 * the pick the user makes in the currency picker, which writes the same draft while the add-card form stays mounted
 * underneath.
 */
function useClearedAddCardDraftCurrency() {
    const [hasCleared, setHasCleared] = useState(false);

    useEffect(() => {
        clearAddPaymentCardDraftCurrency().then(() => setHasCleared(true));
    }, []);

    return hasCleared;
}

export default useClearedAddCardDraftCurrency;

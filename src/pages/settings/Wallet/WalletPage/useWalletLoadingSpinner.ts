import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import debounce from 'lodash/debounce';
import {useEffect, useState} from 'react';

/**
 * Mirrors IS_LOADING_PAYMENT_METHODS into local state. While offline the change is debounced so the spinner does not
 * flash when the app briefly reports loading before the queue settles; when online it's applied immediately.
 */
function useWalletLoadingSpinner(): boolean {
    const [isLoadingPaymentMethods = true] = useOnyx(ONYXKEYS.IS_LOADING_PAYMENT_METHODS);
    const {isOffline} = useNetwork();
    const [shouldShowLoadingSpinner, setShouldShowLoadingSpinner] = useState(false);

    const updateShouldShowLoadingSpinner = () => {
        // In order to prevent a loop, only update state of the spinner if there is a change
        if (isLoadingPaymentMethods === shouldShowLoadingSpinner) {
            return;
        }
        setShouldShowLoadingSpinner(isLoadingPaymentMethods && !isOffline);
    };

    const debounceSetShouldShowLoadingSpinner = debounce(updateShouldShowLoadingSpinner, CONST.TIMING.SHOW_LOADING_SPINNER_DEBOUNCE_TIME);

    useEffect(() => {
        // If the user was previously offline, skip debouncing showing the loader
        if (!isOffline) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the Onyx loading flag into local state so the offline case can be debounced
            updateShouldShowLoadingSpinner();
        } else {
            debounceSetShouldShowLoadingSpinner();
        }
    }, [isOffline, debounceSetShouldShowLoadingSpinner, updateShouldShowLoadingSpinner]);

    return shouldShowLoadingSpinner;
}

export default useWalletLoadingSpinner;

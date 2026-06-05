import {useCallback, useEffect, useRef} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Defers navigation (onSubmit) until the reimbursement account API call completes.
 * Instead of navigating to the next step immediately after firing the API call,
 * this hook waits for `isLoading` to go back to `false` and checks for errors.
 *
 * @param onSubmit - callback that navigates to the next step
 * @returns markSubmitting - call this right after firing the API action
 */
export default function useReimbursementAccountSubmitCallback(onSubmit?: () => void) {
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const isSubmittingRef = useRef(false);

    useEffect(() => {
        if (!isSubmittingRef.current || reimbursementAccount?.isLoading || reimbursementAccount?.errors) {
            return;
        }
        isSubmittingRef.current = false;
        onSubmit?.();
    }, [reimbursementAccount?.isLoading, reimbursementAccount?.errors, onSubmit]);

    return useCallback(() => {
        isSubmittingRef.current = true;
    }, []);
}

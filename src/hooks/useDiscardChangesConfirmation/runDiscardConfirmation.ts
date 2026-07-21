import Log from '@libs/Log';

/**
 * Await `onConfirm`, then replay the blocked navigation — but if `onConfirm` rejects, log and run `onError` WITHOUT
 * navigating, so a failed discard leaves the user in place rather than proceeding silently.
 */
function runDiscardConfirmation(onConfirm: (() => void | Promise<void>) | undefined, navigate: () => void, onError: () => void): void {
    Promise.resolve()
        .then(() => onConfirm?.())
        .then(navigate)
        .catch((error: unknown) => {
            Log.warn('[useDiscardChangesConfirmation] Failed to run onConfirm callback', {error});
            onError();
        });
}

export default runDiscardConfirmation;

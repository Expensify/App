/**
 * Pure decision helpers for the "resync local odometer readings from the transaction" effect in
 * `IOURequestStepDistanceOdometer`
 *
 * That effect keeps the local readings in sync with the transaction without clobbering in-progress typing, and
 * slides the discard-changes baseline when the transaction is changed elsewhere (e.g. an edit saved from the
 * confirmation step). The branching is subtle and easy to regress, so it lives here as small pure predicates
 * that can be unit-tested in isolation from the effect's ref mutations
 */

type OdometerResyncState = {
    /** Transaction readings normalized to strings ('' when the transaction has no reading) */
    transactionStartValue: string;
    transactionEndValue: string;

    /** Readings currently held in local component state */
    localStartValue: string;
    localEndValue: string;

    /** Resolved image URIs from the transaction and from the on-mount baseline */
    transactionStartImageUri: string;
    transactionEndImageUri: string;
    baselineStartImageUri: string;
    baselineEndImageUri: string;

    /** Whether the transaction carries any odometer reading */
    hasTransactionData: boolean;

    /** Whether local state already holds a reading */
    hasLocalState: boolean;

    /** Whether the on-mount initialization has already run */
    hasInitialized: boolean;

    /** Whether the user has typed changes that aren't written to the transaction yet */
    isUserTyping: boolean;

    /** Whether the screen is in edit mode */
    isEditing: boolean;
};

/**
 * An "external resync" is when the transaction was changed somewhere else (e.g. an edit saved from the
 * confirmation step) while nothing is being typed here - so the transaction becomes the new baseline. The
 * typing guard prevents clobbering in-progress keystrokes that aren't in the transaction yet
 */
function isExternalOdometerResync(state: OdometerResyncState): boolean {
    if (!state.hasTransactionData || !state.hasInitialized || state.isUserTyping) {
        return false;
    }
    return (
        state.transactionStartValue !== state.localStartValue ||
        state.transactionEndValue !== state.localEndValue ||
        state.transactionStartImageUri !== state.baselineStartImageUri ||
        state.transactionEndImageUri !== state.baselineEndImageUri
    );
}

/**
 * Whether the local readings should be (re)initialized from the transaction:
 * 1. first mount with transaction data, or
 * 2. editing with transaction data and no local state yet, or
 * 3. transaction has data but local state is empty (user navigated back from another page), or
 * 4. an external resync arrived (the typing guard inside it avoids clobbering in-progress keystrokes)
 */
function shouldInitializeOdometerFromTransaction(state: OdometerResyncState, isExternalResync: boolean): boolean {
    return (
        (!state.hasInitialized && state.hasTransactionData) ||
        (state.isEditing && state.hasTransactionData && !state.hasLocalState) ||
        (state.hasTransactionData && !state.hasLocalState && state.hasInitialized) ||
        isExternalResync
    );
}

export {isExternalOdometerResync, shouldInitializeOdometerFromTransaction};
export type {OdometerResyncState};

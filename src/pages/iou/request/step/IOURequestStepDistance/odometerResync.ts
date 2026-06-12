/**
 * Pure decision helpers for the "resync local odometer readings from the transaction" effect in
 * `IOURequestStepDistanceOdometer`
 *
 * That effect keeps the local readings in sync with the transaction without clobbering in-progress typing, and
 * slides the discard-changes baseline when the transaction is changed elsewhere (e.g. an edit saved from the
 * confirmation step). The branching lives here as small pure predicates that can be unit-tested in isolation
 * from the effect's ref mutations
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
 * 3. transaction has data but local state is empty (navigated back from another page), or
 * 4. an external resync arrived
 *
 * Branches 2-4 carry a `!isUserTyping` guard (inside `isExternalOdometerResync` for branch 4) so they don't
 * re-hydrate readings the user intentionally cleared - which leaves local state empty without writing the
 * transaction, looking identical to "navigated back". Branch 1 is unguarded: a fresh mount must hydrate the baseline.
 */
function shouldInitializeOdometerFromTransaction(state: OdometerResyncState, isExternalResync: boolean): boolean {
    return (
        (!state.hasInitialized && state.hasTransactionData) ||
        (state.isEditing && state.hasTransactionData && !state.hasLocalState && !state.isUserTyping) ||
        (state.hasTransactionData && !state.hasLocalState && state.hasInitialized && !state.isUserTyping) ||
        isExternalResync
    );
}

export {isExternalOdometerResync, shouldInitializeOdometerFromTransaction};
export type {OdometerResyncState};

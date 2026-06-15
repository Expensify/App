/**
 * Pure decision helpers for the "resync local odometer readings from the transaction" effect in
 * `IOURequestStepDistanceOdometer`
 *
 * That effect syncs local readings from the transaction without clobbering in-progress typing, and slides the
 * discard-changes baseline when the transaction changes elsewhere (e.g. an edit saved from the confirmation step).
 * Keeping the branching here as pure predicates lets it be unit-tested apart from the effect's ref mutations
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
 * An "external resync": the transaction changed elsewhere (e.g. an edit saved from the confirmation step) while
 * nothing is being typed here, so it becomes the new baseline. The typing guard avoids clobbering in-progress keystrokes.
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

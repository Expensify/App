import type {OdometerResyncState} from '@libs/OdometerUtils';
import {isExternalOdometerResync, shouldInitializeOdometerFromTransaction} from '@libs/OdometerUtils';

// A steady state: initialized, transaction and local readings match, nothing being typed.
const STEADY_STATE: OdometerResyncState = {
    transactionStartValue: '100',
    transactionEndValue: '200',
    localStartValue: '100',
    localEndValue: '200',
    hasTransactionData: true,
    hasLocalState: true,
    hasInitialized: true,
    isUserTyping: false,
    isEditing: false,
};

function buildState(overrides: Partial<OdometerResyncState> = {}): OdometerResyncState {
    return {...STEADY_STATE, ...overrides};
}

describe('isExternalOdometerResync', () => {
    it('is false in a steady state (everything matches)', () => {
        expect(isExternalOdometerResync(STEADY_STATE)).toBe(false);
    });

    it('is true when a reading was changed externally', () => {
        expect(isExternalOdometerResync(buildState({transactionStartValue: '150'}))).toBe(true);
    });

    // Image changes are intentionally NOT part of this predicate: it slides the readings baseline, so reacting to an
    // image-only change would re-baseline still-unsent readings and silently drop the discard prompt. The image-change
    // discard signal is handled separately by the screen against a never-slid image baseline.

    it('is false before on-mount initialization, even if values differ', () => {
        expect(isExternalOdometerResync(buildState({hasInitialized: false, transactionStartValue: '150'}))).toBe(false);
    });

    it('is false while the user is typing, even if values differ', () => {
        expect(isExternalOdometerResync(buildState({isUserTyping: true, transactionStartValue: '150'}))).toBe(false);
    });

    it('is false when the transaction has no reading data', () => {
        expect(isExternalOdometerResync(buildState({hasTransactionData: false, transactionStartValue: '150'}))).toBe(false);
    });
});

describe('shouldInitializeOdometerFromTransaction', () => {
    it('initializes on first mount when the transaction has data', () => {
        expect(shouldInitializeOdometerFromTransaction(buildState({hasInitialized: false}), false)).toBe(true);
    });

    it('initializes when editing with transaction data and no local state yet', () => {
        expect(shouldInitializeOdometerFromTransaction(buildState({isEditing: true, hasLocalState: false}), false)).toBe(true);
    });

    it('does not re-initialize when editing with empty local state while the user is typing (intentional clear)', () => {
        expect(shouldInitializeOdometerFromTransaction(buildState({isEditing: true, hasLocalState: false, isUserTyping: true}), false)).toBe(false);
    });

    it('initializes when transaction has data but local state is empty (navigated back)', () => {
        expect(shouldInitializeOdometerFromTransaction(buildState({hasLocalState: false}), false)).toBe(true);
    });

    it('still reloads when local state is empty and the user is not typing (navigated back, fresh ref)', () => {
        expect(shouldInitializeOdometerFromTransaction(buildState({hasLocalState: false, isUserTyping: false}), false)).toBe(true);
    });

    it('does not re-hydrate cleared readings while the user is typing (clear-then-delete-image regression)', () => {
        // User cleared both inputs (local state empty, typing flag set) then deleted an image; the
        // transaction still holds the old readings. The third branch must NOT reload them.
        expect(shouldInitializeOdometerFromTransaction(buildState({hasLocalState: false, isUserTyping: true}), false)).toBe(false);
    });

    it('initializes when an external resync arrived', () => {
        expect(shouldInitializeOdometerFromTransaction(buildState({hasTransactionData: false}), true)).toBe(true);
    });

    it('does not initialize in a steady state', () => {
        expect(shouldInitializeOdometerFromTransaction(STEADY_STATE, false)).toBe(false);
    });

    it('does not initialize when the transaction has no data and there is no resync', () => {
        expect(shouldInitializeOdometerFromTransaction(buildState({hasTransactionData: false, hasLocalState: false}), false)).toBe(false);
    });
});

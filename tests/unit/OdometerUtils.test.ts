import type {OdometerResyncState} from '@libs/OdometerUtils';
import {getOdometerTotalDistance, isExternalOdometerResync, shouldInitializeOdometerFromTransaction} from '@libs/OdometerUtils';

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

describe('getOdometerTotalDistance', () => {
    // Readings of 1000 to 1100 entered on a km workspace, then moved to a mi workspace, which converts the quantity
    const CONVERTED_COMMENT = {odometerStart: 1000, odometerEnd: 1100, customUnit: {quantity: 62.1371}};

    it('returns the difference between the readings when nothing is saved yet', () => {
        // Given new readings without a saved conversion to preserve
        const comment = undefined;

        // When their total is calculated before the transaction is saved
        const distance = getOdometerTotalDistance(1000, 1100.5, comment);

        // Then the raw difference is used because no conversion has occurred
        expect(distance).toBe(100.5);
    });

    it('returns the difference between the readings when the saved quantity was not converted', () => {
        // Given a saved quantity in the same unit as the readings
        const comment = {odometerStart: 1000, odometerEnd: 1100, customUnit: {quantity: 100}};

        // When the unchanged readings are totaled
        const distance = getOdometerTotalDistance(1000, 1100, comment);

        // Then no conversion is introduced
        expect(distance).toBe(100);
    });

    it('returns the converted quantity when the readings match the saved ones', () => {
        // Given a saved quantity already converted from kilometers to miles
        const comment = CONVERTED_COMMENT;

        // When the original readings have not changed
        const distance = getOdometerTotalDistance(1000, 1100, comment);

        // Then saving again preserves the converted quantity without rounding it
        expect(distance).toBe(62.1371);
    });

    it('scales changed readings by the same conversion factor', () => {
        // Given readings whose saved total has already been converted to miles
        const comment = CONVERTED_COMMENT;

        // When the new end reading doubles the original distance
        const distance = getOdometerTotalDistance(1000, 1200, comment);

        // Then the new total uses the same conversion instead of treating kilometers as miles
        expect(distance).toBe(124.27);
    });

    it('returns the difference between the readings when the saved readings are not usable', () => {
        // Given saved data that cannot provide a valid conversion factor
        const zeroDifferenceComment = {odometerStart: 1000, odometerEnd: 1000, customUnit: {quantity: 50}};
        const missingQuantityComment = {odometerStart: 1000, odometerEnd: 1100, customUnit: {quantity: null}};

        // When totals are calculated from these incomplete saved values
        const zeroDifferenceTotal = getOdometerTotalDistance(1000, 1100, zeroDifferenceComment);
        const missingQuantityTotal = getOdometerTotalDistance(1000, 1100, missingQuantityComment);

        // Then the raw difference is used instead of an invalid conversion
        expect(zeroDifferenceTotal).toBe(100);
        expect(missingQuantityTotal).toBe(100);
    });
});

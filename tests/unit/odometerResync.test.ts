import type {OdometerResyncState} from '@pages/iou/request/step/IOURequestStepDistance/odometerResync';
import {isExternalOdometerResync, shouldInitializeOdometerFromTransaction} from '@pages/iou/request/step/IOURequestStepDistance/odometerResync';

// A steady state: initialized, transaction and local readings/images all match, nothing being typed.
const STEADY_STATE: OdometerResyncState = {
    transactionStartValue: '100',
    transactionEndValue: '200',
    localStartValue: '100',
    localEndValue: '200',
    transactionStartImageUri: 'start.jpg',
    transactionEndImageUri: 'end.jpg',
    baselineStartImageUri: 'start.jpg',
    baselineEndImageUri: 'end.jpg',
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

    it('is true when only an image was changed externally', () => {
        expect(isExternalOdometerResync(buildState({transactionStartImageUri: 'new-start.jpg'}))).toBe(true);
    });

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

    it('initializes when transaction has data but local state is empty (navigated back)', () => {
        expect(shouldInitializeOdometerFromTransaction(buildState({hasLocalState: false}), false)).toBe(true);
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

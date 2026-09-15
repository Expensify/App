import {claimForRead, finish, getUpgradeCount, isClaimedForRead, isUpgrading, recordUpgrade, start, subscribe} from '@libs/ReceiptStorage/receiptUpgrades';

const RECEIPT = 'receipt_1234.jpg';

describe('receiptUpgrades', () => {
    afterEach(() => {
        finish(RECEIPT);
        jest.useRealTimers();
    });

    it('reports nothing in flight for a receipt that is not being upgraded', () => {
        expect(isUpgrading(RECEIPT)).toBe(false);
        expect(isClaimedForRead(RECEIPT)).toBe(false);
    });

    it('claims a receipt without waiting, so an upload never queues behind a capture', () => {
        start(RECEIPT);
        expect(isClaimedForRead(RECEIPT)).toBe(false);

        // Nothing is awaited here on purpose: this is the whole of what the upload path does, and it runs
        // inside the request the sequential queue is processing.
        claimForRead(RECEIPT);

        expect(isClaimedForRead(RECEIPT)).toBe(true);
        // The upgrade is still running, it just no longer owns the file.
        expect(isUpgrading(RECEIPT)).toBe(true);
    });

    it('ignores a claim on a receipt nothing is upgrading, so an ordinary upload is unaffected', () => {
        claimForRead(RECEIPT);
        expect(isClaimedForRead(RECEIPT)).toBe(false);
    });

    it('keeps a claim for the rest of the upgrade, so a second reader cannot hand the file back', () => {
        start(RECEIPT);
        claimForRead(RECEIPT);
        claimForRead(RECEIPT);

        expect(isClaimedForRead(RECEIPT)).toBe(true);
    });

    it('forgets the claim once the upgrade is over, so the next one starts clean', () => {
        start(RECEIPT);
        claimForRead(RECEIPT);
        finish(RECEIPT);

        start(RECEIPT);
        expect(isClaimedForRead(RECEIPT)).toBe(false);
    });

    it('tells subscribers when a receipt starts and stops changing', () => {
        const listener = jest.fn();
        const unsubscribe = subscribe(listener);

        start(RECEIPT);
        expect(listener).toHaveBeenCalledTimes(1);

        finish(RECEIPT);
        expect(listener).toHaveBeenCalledTimes(2);

        unsubscribe();
        start(RECEIPT);
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('ignores a second start for the same receipt, so one upgrade cannot orphan another', () => {
        start(RECEIPT);
        claimForRead(RECEIPT);
        // A second start must not reset the claim the first upgrade already handed out.
        start(RECEIPT);

        expect(isClaimedForRead(RECEIPT)).toBe(true);
    });

    describe('version count', () => {
        const KEPT_SNAPSHOT = 'receipt_kept_snapshot.jpg';
        const SWAPPED = 'receipt_swapped.jpg';

        it('stays put for an upgrade that finished without replacing the file', () => {
            start(KEPT_SNAPSHOT);
            finish(KEPT_SNAPSHOT);

            // A view keys its image source on this, so bumping it here would re-decode a file that never
            // moved — on the deadline-miss path, which is the common one.
            expect(getUpgradeCount(KEPT_SNAPSHOT)).toBe(0);
        });

        it('moves only when the bytes behind the receipt actually changed', () => {
            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            start(SWAPPED);
            recordUpgrade(SWAPPED);
            finish(SWAPPED);

            expect(getUpgradeCount(SWAPPED)).toBe(1);
            // start, recordUpgrade and finish each tell the views something changed.
            expect(listener).toHaveBeenCalledTimes(3);
            unsubscribe();
        });

        it('forgets the oldest receipts rather than growing for the whole launch', () => {
            const first = 'receipt_first_of_many.jpg';
            recordUpgrade(first);
            for (let index = 0; index < 60; index++) {
                recordUpgrade(`receipt_bulk_${index}.jpg`);
            }

            expect(getUpgradeCount(first)).toBe(0);
            expect(getUpgradeCount('receipt_bulk_59.jpg')).toBe(1);
        });
    });
});

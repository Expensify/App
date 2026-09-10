import {finish, isUpgrading, start, subscribe, waitFor} from '@libs/ReceiptStorage/receiptUpgrades';

const RECEIPT = 'receipt_1234.jpg';
const CAP_MS = 1500;

describe('receiptUpgrades', () => {
    afterEach(() => {
        finish(RECEIPT);
        jest.useRealTimers();
    });

    it('reports nothing in flight for a receipt that is not being upgraded', async () => {
        expect(isUpgrading(RECEIPT)).toBe(false);
        await expect(waitFor(RECEIPT, CAP_MS)).resolves.toBeUndefined();
    });

    it('holds a caller until the upgrade finishes', async () => {
        start(RECEIPT);
        expect(isUpgrading(RECEIPT)).toBe(true);

        let hasWaited = false;
        const waited = waitFor(RECEIPT, CAP_MS).then(() => {
            hasWaited = true;
        });
        await Promise.resolve();
        expect(hasWaited).toBe(false);

        finish(RECEIPT);
        await waited;
        expect(isUpgrading(RECEIPT)).toBe(false);
    });

    it('lets a caller through once it has waited long enough, so a stalled upgrade blocks nothing', async () => {
        jest.useFakeTimers();
        start(RECEIPT);

        const waited = waitFor(RECEIPT, CAP_MS);
        await jest.advanceTimersByTimeAsync(CAP_MS);

        await expect(waited).resolves.toBeUndefined();
        // The upgrade is still running, it just no longer has anyone waiting on it.
        expect(isUpgrading(RECEIPT)).toBe(true);
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

    it('ignores a second start for the same receipt, so one upgrade cannot orphan another', async () => {
        start(RECEIPT);
        start(RECEIPT);

        finish(RECEIPT);

        await expect(waitFor(RECEIPT, CAP_MS)).resolves.toBeUndefined();
    });
});

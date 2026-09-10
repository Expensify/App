/**
 * Tracks receipts whose file is about to be replaced by a better capture, so the rest of the app can wait
 * for the swap or react to it instead of reading a receipt that is about to change.
 *
 * Keyed by durable name, because that is the receipt's identity everywhere else. Entries live only as long
 * as the upgrade: nothing here survives a relaunch, and a receipt with no entry is simply not changing.
 */

import Log from '@libs/Log';

type PendingUpgrade = {
    /** Resolves once the upgrade has finished, bailed or failed. */
    promise: Promise<void>;

    /** Settles `promise`. Called by `finish`. */
    settle: () => void;
};

const upgradesInFlight = new Map<string, PendingUpgrade>();

/** How many times each receipt has been upgraded this launch. Lets a view tell one version from the next. */
const upgradeCounts = new Map<string, number>();

const listeners = new Set<() => void>();

function notify() {
    for (const listener of listeners) {
        listener();
    }
}

/** Announces that a receipt is being upgraded. */
function start(durableName: string) {
    if (upgradesInFlight.has(durableName)) {
        return;
    }

    let settle: () => void = () => {};
    const promise = new Promise<void>((resolveUpgrade) => {
        settle = resolveUpgrade;
    });
    upgradesInFlight.set(durableName, {promise, settle});
    notify();
}

/** Announces that a receipt has stopped changing, whether the upgrade landed or not. */
function finish(durableName: string) {
    const upgrade = upgradesInFlight.get(durableName);
    if (!upgrade) {
        return;
    }

    upgradesInFlight.delete(durableName);
    upgradeCounts.set(durableName, (upgradeCounts.get(durableName) ?? 0) + 1);
    upgrade.settle();
    notify();
}

/**
 * Waits for a receipt to stop changing. Resolves immediately when nothing is in flight, and gives up after
 * `capMs` so a stalled upgrade cannot hold a caller open. Never rejects: the caller reads the file either
 * way, and the upgrade reports its own failures.
 */
function waitFor(durableName: string, capMs: number): Promise<void> {
    const upgrade = upgradesInFlight.get(durableName);
    if (!upgrade) {
        return Promise.resolve();
    }

    return new Promise((settle) => {
        const cap = setTimeout(() => {
            Log.warn('[ReceiptUpgrades] gave up waiting for a receipt upgrade', {durableName, capMs});
            settle();
        }, capMs);
        upgrade.promise.then(() => {
            clearTimeout(cap);
            settle();
        });
    });
}

/**
 * How many upgrades this receipt has been through. A view that renders the file can put this in its image
 * source, so the same path counts as a different image once the bytes behind it change.
 */
function getUpgradeCount(durableName: string): number {
    return upgradeCounts.get(durableName) ?? 0;
}

/** Whether this receipt is being upgraded right now. */
function isUpgrading(durableName: string): boolean {
    return upgradesInFlight.has(durableName);
}

/** Subscribes to changes, for components that show a receipt while it is being upgraded. */
function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export {start, finish, waitFor, isUpgrading, getUpgradeCount, subscribe};

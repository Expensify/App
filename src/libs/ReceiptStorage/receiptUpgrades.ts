/**
 * Tracks receipts whose file is about to be replaced by a better capture.
 *
 * Nothing here waits for an upgrade. Every reader is a request the sequential queue is processing, so a
 * wait would put camera and rotation time in front of every later write, for an optional improvement. A
 * reader claims the receipt instead, and the upgrade drops its photo.
 *
 * Keyed by durable name. Nothing survives a relaunch, and a receipt with no entry is not changing.
 */

import Log from '@libs/Log';

/** Most receipts one launch keeps a version count for. Trimmed oldest-first beyond this. */
const MAX_TRACKED_UPGRADE_COUNTS = 50;

type PendingUpgrade = {
    /** Set once a reader has claimed the receipt, so the file must not change under it. */
    isClaimed: boolean;
};

const upgradesInFlight = new Map<string, PendingUpgrade>();

/** How many times each receipt has been upgraded this launch, so a view can tell one version from the next. */
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

    upgradesInFlight.set(durableName, {isClaimed: false});
    notify();
}

/** Announces that a receipt has stopped changing, whether the upgrade landed or not. */
function finish(durableName: string) {
    const upgrade = upgradesInFlight.get(durableName);
    if (!upgrade) {
        return;
    }

    upgradesInFlight.delete(durableName);
    notify();
}

/**
 * Records that a receipt's bytes actually changed. A view keys its image source on this count, so it moves
 * only when the file did.
 */
function recordUpgrade(durableName: string) {
    upgradeCounts.set(durableName, (upgradeCounts.get(durableName) ?? 0) + 1);

    // Map iteration is insertion-ordered, and re-setting a key keeps its original position, so the front
    // holds the receipts least likely to still be on screen.
    while (upgradeCounts.size > MAX_TRACKED_UPGRADE_COUNTS) {
        const oldest = upgradeCounts.keys().next().value;
        if (oldest === undefined) {
            break;
        }
        upgradeCounts.delete(oldest);
    }

    notify();
}

/**
 * Claims the receipt's current bytes, so the upgrade leaves the file alone. Returns straight away.
 *
 * The upgrade honours this at its last guard before the first rename. A claim landing after that guard
 * cannot stop the swap, which is the one case a reader still has to wait out.
 */
function claimForRead(durableName: string) {
    const upgrade = upgradesInFlight.get(durableName);
    if (!upgrade || upgrade.isClaimed) {
        return;
    }

    upgrade.isClaimed = true;
    Log.info('[ReceiptUpgrades] a reader claimed the receipt, so the upgrade will keep the snapshot', false, {durableName});
}

function getUpgradeCount(durableName: string): number {
    return upgradeCounts.get(durableName) ?? 0;
}

/** Whether a reader has claimed this receipt, meaning its bytes are already on their way to the server. */
function isClaimedForRead(durableName: string): boolean {
    return upgradesInFlight.get(durableName)?.isClaimed ?? false;
}

function isUpgrading(durableName: string): boolean {
    return upgradesInFlight.has(durableName);
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export {start, finish, recordUpgrade, claimForRead, isUpgrading, isClaimedForRead, getUpgradeCount, subscribe};

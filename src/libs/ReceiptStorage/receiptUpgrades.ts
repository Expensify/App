/**
 * Tracks in-flight receipt upgrades and how many times each receipt has been replaced, so views can
 * re-decode a file whose bytes changed under an unchanged path and uploads can claim a receipt.
 */
import Log from '@libs/Log';

const MAX_TRACKED_UPGRADE_COUNTS = 50;

type PendingUpgrade = {
    isClaimed: boolean;
};

const upgradesInFlight = new Map<string, PendingUpgrade>();

const upgradeCounts = new Map<string, number>();

const listeners = new Set<() => void>();

function notify() {
    for (const listener of listeners) {
        listener();
    }
}

function start(durableName: string) {
    if (upgradesInFlight.has(durableName)) {
        return;
    }

    upgradesInFlight.set(durableName, {isClaimed: false});
    notify();
}

function finish(durableName: string) {
    const upgrade = upgradesInFlight.get(durableName);
    if (!upgrade) {
        return;
    }

    upgradesInFlight.delete(durableName);
    notify();
}

function recordUpgrade(durableName: string) {
    upgradeCounts.set(durableName, (upgradeCounts.get(durableName) ?? 0) + 1);

    while (upgradeCounts.size > MAX_TRACKED_UPGRADE_COUNTS) {
        const oldest = upgradeCounts.keys().next().value;
        if (oldest === undefined) {
            break;
        }
        upgradeCounts.delete(oldest);
    }

    notify();
}

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

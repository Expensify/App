import {getUpgradeCount, subscribe} from '@libs/ReceiptStorage/receiptUpgrades';

import {useSyncExternalStore} from 'react';

/**
 * The receipt's durable name, from any URI that points at it. The fragment matters here: a view that has
 * already been handed an upgraded source passes it back in, and keying on it would count a different
 * receipt every time the file changes.
 */
function toDurableName(sourceUri: string | undefined): string {
    return sourceUri?.split('/').pop()?.split('#').at(0)?.split('?').at(0) ?? '';
}

/**
 * How many times the receipt at this URI has been replaced by a better capture during this launch. A view
 * that shows the receipt can use it to tell one version of the file from the next, since the path itself
 * never changes.
 */
function useReceiptUpgradeCount(sourceUri: string | undefined): number {
    return useSyncExternalStore(subscribe, () => getUpgradeCount(toDurableName(sourceUri)));
}

export default useReceiptUpgradeCount;

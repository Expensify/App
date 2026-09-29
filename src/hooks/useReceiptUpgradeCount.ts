import {getUpgradeCount, subscribe} from '@libs/ReceiptStorage/receiptUpgrades';

import {useSyncExternalStore} from 'react';

function toUpgradeKey(sourceUri: unknown): string {
    if (typeof sourceUri !== 'string') {
        return '';
    }
    return sourceUri.split('/').pop()?.split('#').at(0)?.split('?').at(0) ?? '';
}

function useReceiptUpgradeCount(sourceUri: string | number | undefined): number {
    return useSyncExternalStore(subscribe, () => getUpgradeCount(toUpgradeKey(sourceUri)));
}

export default useReceiptUpgradeCount;

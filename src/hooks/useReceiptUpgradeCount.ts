import {getUpgradeCount, subscribe} from '@libs/ReceiptStorage/receiptUpgrades';

import {useSyncExternalStore} from 'react';

function toDurableName(sourceUri: string | undefined): string {
    return sourceUri?.split('/').pop()?.split('#').at(0)?.split('?').at(0) ?? '';
}

function useReceiptUpgradeCount(sourceUri: string | undefined): number {
    return useSyncExternalStore(subscribe, () => getUpgradeCount(toDurableName(sourceUri)));
}

export default useReceiptUpgradeCount;

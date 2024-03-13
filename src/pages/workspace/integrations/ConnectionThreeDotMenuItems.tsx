import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type { PopoverMenuItem } from '@components/PopoverMenu';
import { removePolicyConnection } from '@libs/actions/Policy';

// Enter credentials / disconnect
// Sync now / disconnect

// removePolicyConnection(policy.id, 'quickbooksOnline')

function ConnectionThreeDotMenuItems({policyID}: {policyID: string}) {
    const threeDotsMenuItems: PopoverMenuItem[] = [
        {
            icon: Expensicons.Sync,
            text: 'Sync now',
            onSelected: () => {
            },
        },
        {
            icon: Expensicons.Trashcan,
            text: 'Disconnect',
            onSelected: () => {
                removePolicyConnection(policyID, 'quickbooksOnline')
            },
        },
    ];
    return (
        <ThreeDotsMenu
            menuItems={threeDotsMenuItems}
            anchorPosition={{horizontal: 0, vertical: 0}}
            disabled={false}
        />
    );
}

ConnectionThreeDotMenuItems.displayName = 'ConnectionThreeDotMenuItems';

export default ConnectionThreeDotMenuItems;
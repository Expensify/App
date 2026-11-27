import UserAvatar from '@components/Avatar/UserAvatar';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

import CONST from '@src/CONST';

import React from 'react';

/** Placeholder until design shares the Gmail logo */
function GmailAvatar() {
    const icons = useMemoizedLazyExpensifyIcons(['Mail']);

    return (
        <UserAvatar
            source={icons.Mail}
            accountID={CONST.DEFAULT_NUMBER_ID}
        />
    );
}

export default GmailAvatar;

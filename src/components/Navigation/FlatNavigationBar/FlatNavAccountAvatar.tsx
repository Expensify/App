import AccountNavigationAvatar from '@components/Avatar/AccountNavigationAvatar';

import React, {useContext} from 'react';

import FlatNavItemBackgroundContext from './FlatNavItemBackgroundContext';

type FlatNavAccountAvatarProps = {
    isSelected: boolean;
};

/** The account avatar of the flat navigation bar's Account row, with its badge stroke matching the row's background. */
function FlatNavAccountAvatar({isSelected}: FlatNavAccountAvatarProps) {
    const rowBackgroundColor = useContext(FlatNavItemBackgroundContext);

    return (
        <AccountNavigationAvatar
            isSelected={isSelected}
            badgeBorderColor={rowBackgroundColor}
        />
    );
}

export default FlatNavAccountAvatar;

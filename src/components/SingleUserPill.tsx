import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import UserPill from './UserPill';

type SingleUserPillProps = {
    /** URL or source of the user's avatar image */
    avatar?: AvatarSource;

    /** Display name shown inside the pill */
    displayName: string;

    /** Numeric account ID used for the tooltip and avatar fallback */
    accountID?: number;

    /** Email address shown in the user details tooltip */
    email?: string;
};

function SingleUserPill({avatar, displayName, accountID, email}: SingleUserPillProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.userPillsContainer]}>
            <UserPill
                avatar={avatar}
                displayName={displayName}
                accountID={accountID}
                email={email}
            />
        </View>
    );
}

SingleUserPill.displayName = 'SingleUserPill';

export default SingleUserPill;

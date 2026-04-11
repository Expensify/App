import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import Text from './Text';
import Tooltip from './Tooltip';
import UserPill from './UserPill';

type UserPillData = {
    /** Avatar source (URL or icon) */
    avatar?: AvatarSource;

    /** Display name of the user */
    displayName: string;

    /** Account ID for proper avatar rendering */
    accountID?: number;

    /** Email/login for tooltip subtitle */
    email?: string;
};

type UserPillsProps = {
    /** Array of user data to render as pills */
    users: UserPillData[];

    /** Maximum number of pills to display before showing "+X more" */
    maxVisible?: number;
};

const DEFAULT_MAX_VISIBLE = 9;

function UserPills({users, maxVisible = DEFAULT_MAX_VISIBLE}: UserPillsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // "+1 more" edge case: if only 1 user would be hidden, show it instead of "+1 more"
    const visibleUsers = users.length <= maxVisible + 1 ? users : users.slice(0, maxVisible);
    const hiddenCount = users.length - visibleUsers.length;
    const hiddenNames =
        hiddenCount > 0
            ? users
                  .slice(visibleUsers.length)
                  .map((u) => u.displayName)
                  .join(', ')
            : '';

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.userPillsContainer]}>
            {visibleUsers.map((user) => (
                <UserPill
                    key={user.accountID ?? user.displayName}
                    avatar={user.avatar}
                    displayName={user.displayName}
                    accountID={user.accountID}
                    email={user.email}
                />
            ))}
            {hiddenCount > 0 && (
                <Tooltip text={hiddenNames}>
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <Text style={styles.userPillMoreText}>{translate('common.plusMore', {count: hiddenCount})}</Text>
                    </View>
                </Tooltip>
            )}
        </View>
    );
}

UserPills.displayName = 'UserPills';

export default UserPills;
export type {UserPillData, UserPillsProps};

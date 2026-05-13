import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import Text from './Text';
import Tooltip from './Tooltip';
import UserPill from './UserPill';

type UserPillData = {
    avatar?: AvatarSource;
    displayName: string;
    accountID?: number;
    email?: string;
};

type UserPillsProps = {
    users: UserPillData[];
    maxVisible?: number;
};

const DEFAULT_MAX_VISIBLE = 6;

function UserPills({users, maxVisible = DEFAULT_MAX_VISIBLE}: UserPillsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // Show the extra pill instead of "+1 more" when only 1 would be hidden.
    const visibleUsers = users.length <= maxVisible + 1 ? users : users.slice(0, maxVisible);
    const hiddenCount = users.length - visibleUsers.length;
    const hiddenNames =
        hiddenCount > 0
            ? users
                  .slice(visibleUsers.length)
                  .map((u) => Str.removeSMSDomain(u.displayName))
                  .join(', ')
            : '';

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.userPillsContainer]}>
            {visibleUsers.map((user) => {
                const hasRealAccountID = user.accountID !== undefined && user.accountID !== CONST.DEFAULT_NUMBER_ID;
                return (
                    <UserPill
                        key={hasRealAccountID ? user.accountID : (user.email ?? user.displayName)}
                        avatar={user.avatar}
                        displayName={user.displayName}
                        accountID={user.accountID}
                        email={user.email}
                    />
                );
            })}
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

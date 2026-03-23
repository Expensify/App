import React, {useMemo} from 'react';
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
};

type UserPillsProps = {
    /** Array of user data to render as pills */
    users: UserPillData[];

    /** Maximum number of pills to display before showing "+X more" */
    maxElements?: number;
};

const DEFAULT_MAX_ELEMENTS = 10;

function UserPills({users, maxElements = DEFAULT_MAX_ELEMENTS}: UserPillsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const visibleUsers = useMemo(() => {
        if (users.length <= maxElements) {
            return users;
        }
        return users.slice(0, maxElements);
    }, [users, maxElements]);

    const hiddenCount = users.length - visibleUsers.length;
    const hiddenNames = useMemo(() => {
        if (hiddenCount <= 0) {
            return '';
        }
        return users
            .slice(maxElements)
            .map((u) => u.displayName)
            .join(', ');
    }, [users, maxElements, hiddenCount]);

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.userPillsContainer]}>
            {visibleUsers.map((user) => (
                <UserPill
                    key={user.accountID ?? user.displayName}
                    avatar={user.avatar}
                    displayName={user.displayName}
                    accountID={user.accountID}
                />
            ))}
            {hiddenCount > 0 && (
                <Tooltip text={hiddenNames}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.userPillMore]}>
                        <Text style={[styles.userPillMoreText]}>{translate('common.plusMore', {count: hiddenCount})}</Text>
                    </View>
                </Tooltip>
            )}
        </View>
    );
}

UserPills.displayName = 'UserPills';

export default UserPills;
export type {UserPillData, UserPillsProps};

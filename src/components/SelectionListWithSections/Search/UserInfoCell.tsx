import React, {useCallback, useEffect} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Log from '@libs/Log';
import useOnyx from '@hooks/useOnyx';
import {getPersonalDetailsForAccountID} from '@libs/ReportUtils';
import {isCorrectSearchUserName} from '@libs/SearchUIUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import type {AvatarSizeName} from '@styles/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

type UserInfoCellProps = {
    accountID: number | undefined;
    avatar: AvatarSource | undefined;
    displayName: string;
    avatarSize?: AvatarSizeName;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: TextStyle;
    avatarStyle?: ViewStyle;
};

const loggedAvatarResolutionMismatches = new Set<string>();
const getAvatarSourceLabel = (source: AvatarSource | undefined) => (typeof source === 'string' ? source : source ? 'iconAsset' : 'empty');

function UserInfoCell({avatar, accountID, displayName, avatarSize, containerStyle, textStyle, avatarStyle}: UserInfoCellProps) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const personalDetailSelector = useCallback(
        (personalDetailsList: OnyxEntry<PersonalDetailsList>) => (accountID ? personalDetailsList?.[accountID] : undefined),
        [accountID],
    );
    const [personalDetailsFromSnapshot] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailSelector, canBeMissing: true}, [accountID]);
    const personalDetailsFromOnyx = accountID ? getPersonalDetailsForAccountID(accountID) : undefined;
    const avatarSource = personalDetailsFromOnyx?.avatar || personalDetailsFromSnapshot?.avatar || avatar;
    const onyxAvatar = personalDetailsFromOnyx?.avatar;
    const snapshotAvatar = personalDetailsFromSnapshot?.avatar;

    useEffect(() => {
        if (!accountID) {
            return;
        }

        const shouldLogMismatch = (!!onyxAvatar && avatarSource !== onyxAvatar) || (!avatarSource && (!!onyxAvatar || !!snapshotAvatar || !!avatar));
        if (!shouldLogMismatch) {
            return;
        }

        const logKey = `${accountID}-${getAvatarSourceLabel(avatarSource)}-${getAvatarSourceLabel(onyxAvatar)}-${getAvatarSourceLabel(snapshotAvatar)}-${getAvatarSourceLabel(avatar)}`;
        if (loggedAvatarResolutionMismatches.has(logKey)) {
            return;
        }

        loggedAvatarResolutionMismatches.add(logKey);
        Log.info('[AvatarDebug][UserInfoCell] Avatar source mismatch detected', false, {
            accountID,
            selectedSource: getAvatarSourceLabel(avatarSource),
            onyxSource: getAvatarSourceLabel(onyxAvatar),
            snapshotSource: getAvatarSourceLabel(snapshotAvatar),
            rowSource: getAvatarSourceLabel(avatar),
        });
    }, [accountID, avatarSource, onyxAvatar, snapshotAvatar, avatar]);

    if (!isCorrectSearchUserName(displayName) || !accountID) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, containerStyle]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={avatarSize ?? CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                source={avatarSource}
                name={displayName}
                type={CONST.ICON_TYPE_AVATAR}
                avatarID={accountID}
                containerStyles={[styles.pr2, avatarStyle]}
            />
            <Text
                numberOfLines={1}
                style={[isLargeScreenWidth ? styles.themeTextColor : styles.textMicroSupporting, styles.flexShrink1, textStyle]}
            >
                {displayName}
            </Text>
        </View>
    );
}

export default UserInfoCell;

import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AvatarSizeName} from '@styles/utils';
import variables from '@styles/variables';
import type {PersonalDetails} from '@src/types/onyx';
import type {SearchPersonalDetails} from '@src/types/onyx/SearchResults';
import UserInfoCell from './UserInfoCell';

function UserInfoCellsWithArrow({
    shouldShowToRecipient,
    participantFrom,
    participantFromDisplayName,
    participantTo,
    participantToDisplayName,
    avatarSize,
    style,
    infoCellsTextStyle,
    infoCellsAvatarStyle,
    fromRecipientStyle,
}: {
    shouldShowToRecipient: boolean;
    participantFrom: SearchPersonalDetails | PersonalDetails;
    participantFromDisplayName: string;
    participantTo: SearchPersonalDetails | PersonalDetails;
    participantToDisplayName: string;
    style?: StyleProp<ViewStyle>;
    avatarSize?: AvatarSizeName;
    infoCellsTextStyle?: TextStyle;
    infoCellsAvatarStyle?: ViewStyle;
    fromRecipientStyle?: ViewStyle;
}) {
    const styles = useThemeStyles();
    const theme = useTheme();

    if (!participantFrom) {
        return null;
    }

    return (
        <View style={[styles.flex1, style]}>
            <UserInfoCell
                accountID={participantFrom.accountID}
                avatar={participantFrom.avatar}
                displayName={participantFromDisplayName}
                avatarSize={avatarSize}
                textStyle={infoCellsTextStyle}
                avatarStyle={infoCellsAvatarStyle}
                containerStyle={[styles.mw50, styles.flexShrink1, fromRecipientStyle]}
            />
            {shouldShowToRecipient && (
                <>
                    <Icon
                        src={Expensicons.ArrowRightLong}
                        width={variables.iconSizeXXSmall}
                        height={variables.iconSizeXXSmall}
                        fill={theme.icon}
                        testID="ArrowRightLong Icon"
                    />
                    <UserInfoCell
                        accountID={participantTo.accountID}
                        avatar={participantTo.avatar}
                        displayName={participantToDisplayName}
                        avatarSize={avatarSize}
                        textStyle={infoCellsTextStyle}
                        avatarStyle={infoCellsAvatarStyle}
                        containerStyle={[styles.mw50, styles.flexShrink1, fromRecipientStyle]}
                    />
                </>
            )}
        </View>
    );
}

UserInfoCellsWithArrow.displayName = 'UserInfoCellsWithArrow';

export default UserInfoCellsWithArrow;

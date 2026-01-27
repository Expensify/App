import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AvatarSizeName} from '@styles/utils';
import variables from '@styles/variables';
import type {PersonalDetails} from '@src/types/onyx';
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
    shouldUseArrowIcon = true,
}: {
    shouldShowToRecipient: boolean;
    participantFrom: PersonalDetails;
    participantFromDisplayName: string;
    participantTo: PersonalDetails;
    participantToDisplayName: string;
    style?: StyleProp<ViewStyle>;
    avatarSize?: AvatarSizeName;
    infoCellsTextStyle?: TextStyle;
    infoCellsAvatarStyle?: ViewStyle;
    fromRecipientStyle?: ViewStyle;
    shouldUseArrowIcon?: boolean;
}) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRightLong']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

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
                    {shouldUseArrowIcon ? (
                        <Icon
                            src={icons.ArrowRightLong}
                            width={variables.iconSizeXXSmall}
                            height={variables.iconSizeXXSmall}
                            fill={theme.icon}
                            testID="UserInfoToIndicator"
                        />
                    ) : (
                        <Text
                            testID="UserInfoToIndicator"
                            style={[styles.textMicroSupporting]}
                        >
                            {translate('common.conjunctionTo')}
                        </Text>
                    )}
                    <UserInfoCell
                        accountID={participantTo.accountID}
                        avatar={participantTo.avatar}
                        displayName={participantToDisplayName}
                        avatarSize={avatarSize}
                        textStyle={infoCellsTextStyle}
                        avatarStyle={infoCellsAvatarStyle}
                        containerStyle={[styles.mw50, styles.flexShrink1, fromRecipientStyle, styles.mlHalf]}
                    />
                </>
            )}
        </View>
    );
}

export default UserInfoCellsWithArrow;

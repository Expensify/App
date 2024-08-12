import React from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Avatar from './Avatar';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

function AccountSwitcher() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const avatarUrl = currentUserPersonalDetails?.avatar ?? '';
    const accountID = currentUserPersonalDetails?.accountID ?? -1;
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <PressableWithFeedback
            accessible
            accessibilityLabel={translate('common.profile')}
        >
            <View style={[styles.flexRow, styles.gap3]}>
                <Avatar
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MEDIUM}
                    avatarID={accountID}
                    source={avatarUrl}
                    fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                />
                <View style={[styles.justifyContentCenter, styles.gap1]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.cardSectionTitle, styles.textBold]}
                    >
                        {currentUserPersonalDetails?.displayName}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={styles.colorMuted}
                    >
                        {currentUserPersonalDetails?.login}
                    </Text>
                </View>
            </View>
        </PressableWithFeedback>
    );
}

export default AccountSwitcher;

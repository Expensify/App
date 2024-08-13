import React from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Avatar from './Avatar';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

function AccountSwitcher() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const avatarUrl = currentUserPersonalDetails?.avatar ?? '';
    const accountID = currentUserPersonalDetails?.accountID ?? -1;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();

    return (
        <PressableWithFeedback
            accessible
            accessibilityLabel={translate('common.profile')}
            onPress={() => {}}
            wrapperStyle={[styles.flexGrow1, styles.accountSwitcherWrapper, styles.justifyContentCenter]}
        >
            <View style={[styles.flexRow, styles.gap3]}>
                <Avatar
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MEDIUM}
                    avatarID={accountID}
                    source={avatarUrl}
                    fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                />
                <View style={[styles.flex1, styles.flexShrink1, styles.flexBasis0, styles.justifyContentCenter]}>
                    <View style={[styles.flexRow, styles.gap1]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.textBold, styles.optionDisplayNameCompact, styles.pre]}
                        >
                            {currentUserPersonalDetails?.displayName}
                        </Text>
                        <View style={styles.justifyContentCenter}>
                            <Icon
                                fill={theme.icon}
                                src={Expensicons.CaretUpDown}
                                height={variables.iconSizeSmall}
                                width={variables.iconSizeSmall}
                            />
                        </View>
                    </View>
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

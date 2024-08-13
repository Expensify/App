import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Avatar from './Avatar';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PopoverMenu from './PopoverMenu';
import type {PopoverMenuItem} from './PopoverMenu';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

function AccountSwitcher() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const avatarUrl = currentUserPersonalDetails?.avatar ?? '';
    const accountID = currentUserPersonalDetails?.accountID ?? -1;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {canUseNewDotCopilot} = usePermissions();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [shouldShowDelegateMenu, setShouldShowDelegateMenu] = useState(false);

    const buttonRef = useRef<HTMLDivElement>(null);

    const delegates = account?.delegatedAccess?.delegates ?? [];
    const shouldShowDelegates = delegates.length > 0 && canUseNewDotCopilot;

    const delegateMenuItems: PopoverMenuItem[] = delegates.map(({email, role}) => ({
        text: `${email} (${role})`,
        onPress: () => {},
    }));

    useEffect(() => {
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        Onyx.merge(ONYXKEYS.ACCOUNT, {
            delegatedAccess: {
                delegates: [
                    {email: 'delegate1@expensify.com', role: 'all'},
                    {email: 'delegate2@expensify.com', role: 'submitter'},
                ],
            },
        });
    }, []);

    return (
        <>
            <PressableWithFeedback
                accessible
                accessibilityLabel={translate('common.profile')}
                onPress={() => {
                    setShouldShowDelegateMenu(!shouldShowDelegateMenu);
                }}
                ref={buttonRef}
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
                                style={[styles.textBold]}
                            >
                                {currentUserPersonalDetails?.displayName}
                            </Text>
                            {shouldShowDelegates && (
                                <View style={styles.justifyContentCenter}>
                                    <Icon
                                        fill={theme.icon}
                                        src={Expensicons.CaretUpDown}
                                        height={variables.iconSizeSmall}
                                        width={variables.iconSizeSmall}
                                    />
                                </View>
                            )}
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
            <PopoverMenu
                headerText="Switch accounts:"
                isVisible={shouldShowDelegateMenu}
                onClose={() => setShouldShowDelegateMenu(false)}
                onItemSelected={() => {}}
                menuItems={delegateMenuItems}
                anchorRef={buttonRef}
                anchorPosition={styles.createAccountSwitcherPosition()}
            />
        </>
    );
}

export default AccountSwitcher;

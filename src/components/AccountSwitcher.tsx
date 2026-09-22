import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {canSwitchAccountsSelector} from '@selectors/Account';
import {accountIDSelector} from '@selectors/Session';
import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';

import AccountSwitcherButton from './AccountSwitcherButton';
import UserAvatar from './Avatar/UserAvatar';
import Text from './Text';

type AccountSwitcherProps = {
    /** Whether the screen is focused. Used to hide the product training tooltip */
    isScreenFocused: boolean;

    /** Whether to render the Switch button next to the account details. Wide layouts render it in the top bar instead. */
    shouldShowSwitchButton?: boolean;
};

function AccountSwitcher({isScreenFocused, shouldShowSwitchButton = true}: AccountSwitcherProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const styles = useThemeStyles();
    const {formatPhoneNumber} = useLocalize();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [hasLoadedApp] = useOnyx(ONYXKEYS.HAS_LOADED_APP);

    const canSwitchAccounts = canSwitchAccountsSelector(account);

    const isAccountSwitchInFlight = !!isLoadingApp && !!hasLoadedApp;
    const [wasAbleToSwitchAccounts, setWasAbleToSwitchAccounts] = useState(canSwitchAccounts);
    if (!isAccountSwitchInFlight && wasAbleToSwitchAccounts !== canSwitchAccounts) {
        setWasAbleToSwitchAccounts(canSwitchAccounts);
    }

    const displayName = currentUserPersonalDetails.displayName ?? '';
    const doesDisplayNameContainEmojis = new RegExp(CONST.REGEX.EMOJIS, CONST.REGEX.EMOJIS.flags.concat('g')).test(displayName);

    // A landscape phone is still a narrow layout, but the tall stacked header would eat most of the screen height there.
    const shouldStackHeader = shouldUseNarrowLayout && !isInLandscapeMode;
    const displayNameStyle = shouldStackHeader ? [styles.textHeadlineH1, styles.textAlignCenter] : [styles.textBold, styles.textNormal, styles.flexShrink1, styles.lineHeightXLarge];
    const avatarSize = shouldStackHeader ? CONST.AVATAR_SIZE.XXXX_LARGE : CONST.AVATAR_SIZE.DEFAULT;
    const shouldReserveSwitchButtonRow = shouldShowSwitchButton && shouldStackHeader && wasAbleToSwitchAccounts && !canSwitchAccounts && isAccountSwitchInFlight;

    return (
        <View
            style={
                shouldStackHeader ? [styles.alignItemsCenter, styles.gap4, styles.w100] : [styles.flexRow, styles.gap3, styles.alignItemsCenter, styles.flexGrow1, styles.flex1, styles.mnw0]
            }
        >
            <View
                style={
                    shouldStackHeader
                        ? [styles.alignItemsCenter, styles.gap3, styles.w100]
                        : [styles.flexRow, styles.gap3, styles.alignItemsCenter, styles.flex1, styles.flexShrink1, styles.mnw0, styles.justifyContentCenter]
                }
            >
                <UserAvatar
                    size={avatarSize}
                    accountID={currentUserPersonalDetails.accountID}
                    source={currentUserPersonalDetails.avatar}
                    fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                />
                <View
                    style={
                        shouldStackHeader
                            ? [styles.alignItemsCenter, styles.gap1, styles.w100]
                            : [styles.flex1, styles.flexShrink1, styles.flexBasis0, styles.justifyContentCenter, styles.gapHalf]
                    }
                >
                    {doesDisplayNameContainEmojis ? (
                        <Text numberOfLines={1}>
                            <TextWithEmojiFragment
                                message={displayName}
                                style={displayNameStyle}
                            />
                        </Text>
                    ) : (
                        <Text
                            numberOfLines={1}
                            style={displayNameStyle}
                        >
                            {formatPhoneNumber(displayName)}
                        </Text>
                    )}
                    <Text
                        numberOfLines={1}
                        style={[styles.colorMuted, styles.fontSizeLabel, shouldStackHeader && styles.textAlignCenter]}
                    >
                        {Str.removeSMSDomain(currentUserPersonalDetails.login ?? '')}
                    </Text>
                    {!!isDebugModeEnabled && (
                        <Text
                            style={[styles.textLabelSupporting, styles.mt1, styles.w100, shouldStackHeader && styles.textAlignCenter]}
                            numberOfLines={1}
                        >
                            AccountID: {accountID}
                        </Text>
                    )}
                </View>
            </View>
            {!!shouldShowSwitchButton && <AccountSwitcherButton isScreenFocused={isScreenFocused} />}
            {!!shouldReserveSwitchButtonRow && (
                <View
                    testID={CONST.ACCOUNT_SWITCHER_BUTTON_PLACEHOLDER_TEST_ID}
                    style={styles.minHeightComponentSizeSmall}
                />
            )}
        </View>
    );
}

export default AccountSwitcher;

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {openExternalLink} from '@libs/actions/Link';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';
import {getAccountIDFromAvatarID} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import AccountAvatar from './Avatar/connected/AccountAvatar';
import Button from './Button';
import Text from './Text';

type AccountManagerBookCallButtonProps = {
    /** The account manager's calendar link to open when the button is pressed */
    calendarLink: string;

    /** When provided, the account manager's avatar is displayed instead of a phone icon */
    accountManagerAccountID?: string;

    /** Whether this button is nested inside another pressable element */
    isNested?: boolean;

    /** Additional styles to apply to the button */
    style?: StyleProp<ViewStyle>;
};

function AccountManagerBookCallButton({calendarLink, accountManagerAccountID, isNested = false, style}: AccountManagerBookCallButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Phone']);

    if (!calendarLink) {
        return null;
    }

    const label = translate('videoChatButtonAndMenu.tooltip');

    const commonProps = {
        onPress: callFunctionIfActionIsAllowed(() => openExternalLink(calendarLink)),
        sentryLabel: CONST.SENTRY_LABEL.ACCOUNT_MANAGER_BOOK_CALL.BUTTON,
        accessibilityLabel: label,
        isNested,
        medium: true as const,
        style,
    };

    if (!accountManagerAccountID) {
        return (
            <Button
                text={label}
                icon={icons.Phone}
                {...commonProps}
            />
        );
    }

    return (
        <Button {...commonProps}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.gap2]}>
                <AccountAvatar
                    accountID={getAccountIDFromAvatarID(accountManagerAccountID)}
                    size={CONST.AVATAR_SIZE.XXX_SMALL}
                    shouldShowTooltip={false}
                />
                <Text style={[styles.buttonText, styles.buttonMediumText]}>{label}</Text>
            </View>
        </Button>
    );
}

export default AccountManagerBookCallButton;

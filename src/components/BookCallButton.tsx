import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {openExternalLink} from '@libs/actions/Link';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import AccountAvatar from './Avatar/connected/AccountAvatar';
import {AvatarTooltipsProvider} from './Avatar/tooltips/AvatarTooltipContext';
import Button from './Button';
import Text from './Text';

type BookCallButtonProps = {
    /** The calendar link to open when the button is pressed */
    calendarLink: string;

    /** When provided, this account's avatar is displayed instead of a phone icon */
    avatarAccountID?: number;

    /** Whether this button is nested inside another pressable element */
    isNested?: boolean;

    /** Additional styles to apply to the button */
    style?: StyleProp<ViewStyle>;
};

function BookCallButton({calendarLink, avatarAccountID, isNested = false, style}: BookCallButtonProps) {
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

    if (!avatarAccountID) {
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
                <AvatarTooltipsProvider isEnabled={false}>
                    <AccountAvatar
                        accountID={avatarAccountID}
                        size={CONST.AVATAR_SIZE.XXX_SMALL}
                    />
                </AvatarTooltipsProvider>
                <Text style={[styles.buttonText, styles.buttonMediumText]}>{label}</Text>
            </View>
        </Button>
    );
}

export default BookCallButton;

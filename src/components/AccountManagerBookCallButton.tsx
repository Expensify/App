import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import Avatar from './Avatar';
import Button from './Button';
import Text from './Text';

type AccountManagerBookCallButtonProps = {
    /** The account manager's calendar link to open when the button is pressed */
    calendarLink: string;

    /** When provided, the account manager's avatar is displayed instead of a phone icon */
    accountManagerAccountID?: string;

    /** Whether to show the account manager's avatar instead of the phone icon */
    shouldShowAvatar?: boolean;

    /** Whether this button is nested inside another pressable element */
    isNested?: boolean;

    /** Additional styles to apply to the button */
    style?: StyleProp<ViewStyle>;
};

function AccountManagerBookCallButton({calendarLink, accountManagerAccountID, shouldShowAvatar = false, isNested = false, style}: AccountManagerBookCallButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Phone']);
    const [accountManagerDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (personalDetails: PersonalDetailsList | undefined) => (shouldShowAvatar && accountManagerAccountID ? personalDetails?.[accountManagerAccountID] : undefined),
    });

    if (!calendarLink) {
        return null;
    }

    const label = translate('videoChatButtonAndMenu.tooltip');

    if (!shouldShowAvatar) {
        return (
            <Button
                text={label}
                icon={icons.Phone}
                onPress={callFunctionIfActionIsAllowed(() => openExternalLink(calendarLink))}
                sentryLabel={CONST.SENTRY_LABEL.ACCOUNT_MANAGER_BOOK_CALL.BUTTON}
                accessibilityLabel={label}
                isNested={isNested}
                medium
                style={style}
            />
        );
    }

    return (
        <Button
            accessibilityLabel={label}
            onPress={callFunctionIfActionIsAllowed(() => openExternalLink(calendarLink))}
            sentryLabel={CONST.SENTRY_LABEL.ACCOUNT_MANAGER_BOOK_CALL.BUTTON}
            isNested={isNested}
            medium
            style={style}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.gap2]}>
                <Avatar
                    source={accountManagerDetails?.avatar}
                    avatarID={accountManagerAccountID}
                    name={accountManagerDetails?.displayName ?? accountManagerDetails?.login}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.SMALL}
                />
                <Text style={[styles.buttonText, styles.buttonMediumText]}>{label}</Text>
            </View>
        </Button>
    );
}

AccountManagerBookCallButton.displayName = 'AccountManagerBookCallButton';

export default AccountManagerBookCallButton;

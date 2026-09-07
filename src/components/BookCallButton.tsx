import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import {openExternalLink} from '@libs/actions/Link';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import UserAvatar from './Avatar/UserAvatar';
import Button from './ButtonComposed';
import {usePersonalDetails} from './OnyxListItemProvider';

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
    const icons = useMemoizedLazyExpensifyIcons(['Phone']);
    const personalDetails = usePersonalDetails();
    const avatarDetails = avatarAccountID ? personalDetails?.[avatarAccountID] : undefined;

    if (!calendarLink) {
        return null;
    }

    const label = translate('videoChatButtonAndMenu.tooltip');

    const commonProps = {
        onPress: callFunctionIfActionIsAllowed(() => openExternalLink(calendarLink)),
        sentryLabel: CONST.SENTRY_LABEL.ACCOUNT_MANAGER_BOOK_CALL.BUTTON,
        accessibilityLabel: label,
        isNested,
        style,
    };

    if (!avatarAccountID) {
        return (
            <Button {...commonProps}>
                <Button.Icon src={icons.Phone} />
                <Button.Text>{label}</Button.Text>
            </Button>
        );
    }

    return (
        <Button {...commonProps}>
            <UserAvatar
                accountID={avatarAccountID}
                source={avatarDetails?.avatar}
                fallbackIcon={avatarDetails?.fallbackIcon}
                size={CONST.AVATAR_SIZE.XXX_SMALL}
            />
            <Button.Text>{label}</Button.Text>
        </Button>
    );
}

export default BookCallButton;

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {openExternalLink} from '@libs/actions/Link';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';

import Avatar from './Avatar';
import Button from './ButtonComposed';

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
    const [avatarDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (personalDetails: PersonalDetailsList | undefined) => (avatarAccountID ? personalDetails?.[avatarAccountID] : undefined),
    });

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
            <Avatar
                source={avatarDetails?.avatar}
                avatarID={avatarAccountID}
                name={avatarDetails?.displayName ?? avatarDetails?.login}
                type={CONST.ICON_TYPE_AVATAR}
                size={CONST.AVATAR_SIZE.XXX_SMALL}
            />
            <Button.Text>{label}</Button.Text>
        </Button>
    );
}

export default BookCallButton;

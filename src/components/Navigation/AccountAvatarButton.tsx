import AccountNavigationAvatar from '@components/Avatar/AccountNavigationAvatar';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useIsFocused, useRoute} from '@react-navigation/native';
import React from 'react';

/**
 * Avatar of the signed-in user that navigates to the Account tab. Rendered only in the narrow layout, where
 * the Account tab is not part of the navigation tab bar.
 */
function AccountAvatarButton() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (!shouldUseNarrowLayout) {
        return null;
    }

    return <AccountAvatarButtonContent />;
}

function AccountAvatarButtonContent() {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {status} = useAccountTabIndicatorStatus();
    const isFocused = useIsFocused();
    const isSelected = useRoute().name === SCREENS.SETTINGS.ROOT;

    const navigateToAccount = () => {
        if (isSelected) {
            return;
        }
        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.SETTINGS);
        }, session);
    };

    return (
        <Tooltip
            text={translate('initialSettingsPage.account')}
            isFocused={isFocused}
        >
            <PressableWithoutFeedback
                onPress={navigateToAccount}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={`${translate('initialSettingsPage.account')}. ${status ? `${translate('common.yourReviewIsRequired')}.` : ''}`}
                style={[styles.flexRow, styles.touchableButtonImage, styles.ml1]}
                sentryLabel={CONST.SENTRY_LABEL.TOP_BAR.ACCOUNT_BUTTON}
            >
                <AccountNavigationAvatar
                    isSelected={isSelected}
                    size={CONST.AVATAR_SIZE.MID_SMALL}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default AccountAvatarButton;

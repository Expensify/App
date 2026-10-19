import AccountNavigationAvatar from '@components/Avatar/AccountNavigationAvatar';
import {PressableWithoutFeedback} from '@components/Pressable';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import Tooltip from '@components/Tooltip';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useIsFocused, useRoute} from '@react-navigation/native';
import React from 'react';

/**
 * Avatar of the signed-in user that navigates to the Account tab. Rendered only in the narrow layout, where
 * the Account tab is not part of the navigation tab bar.
 */
function AccountAvatarButton() {
    const {isBetaEnabled} = usePermissions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (!shouldUseNarrowLayout || !isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE)) {
        return null;
    }

    return <AccountAvatarButtonContent />;
}

function AccountAvatarButtonContent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {status} = useAccountTabIndicatorStatus();
    const isAnonymousUser = useIsAnonymousUser();
    const isFocused = useIsFocused();
    const isSelected = useRoute().name === SCREENS.SETTINGS.ROOT;

    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.ACCOUNT_MOVED_TO_TOP_BAR,
        isFocused && !isAnonymousUser,
    );

    const navigateToAccount = () => {
        hideProductTrainingTooltip();
        if (isSelected) {
            return;
        }
        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.SETTINGS);
        });
    };

    const TooltipToRender = shouldShowProductTrainingTooltip ? EducationalTooltip : Tooltip;
    const tooltipProps = shouldShowProductTrainingTooltip
        ? {
              shouldRender: true,
              renderTooltipContent: renderProductTrainingTooltip,
              wrapperStyle: styles.productTrainingTooltipWrapper,
              onTooltipPress: navigateToAccount,
              anchorAlignment: {
                  horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                  vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
              },
              shiftHorizontal: variables.accountAvatarTooltipShiftHorizontal,
          }
        : {text: translate('initialSettingsPage.account'), isFocused};

    return (
        <TooltipToRender {...tooltipProps}>
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
        </TooltipToRender>
    );
}

export default AccountAvatarButton;

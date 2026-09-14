import AccountNavigationAvatar from '@components/Avatar/AccountNavigationAvatar';
import {PressableWithoutFeedback} from '@components/Pressable';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import Tooltip from '@components/Tooltip';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useThemeStyles from '@hooks/useThemeStyles';

import {getTabState} from '@libs/Navigation/helpers/tabNavigatorUtils';
import Navigation from '@libs/Navigation/Navigation';

import {isAnonymousUser} from '@userActions/Session';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';

const authTokenTypeSelector = (session: OnyxEntry<Session>) => session && {authTokenType: session.authTokenType};

/**
 * Avatar of the signed-in user that navigates to the Account tab.
 */
function AccountAvatarButton() {
    const {isBetaEnabled} = usePermissions();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    if (!isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE) || isAnonymousUser(session)) {
        return null;
    }

    return <AccountAvatarButtonContent />;
}

function AccountAvatarButtonContent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {status} = useAccountTabIndicatorStatus();
    const isFocused = useIsFocused();

    const isSelected = useRootNavigationState((rootState) => {
        const tabState = getTabState(rootState?.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR));
        return tabState?.routes.at(tabState.index ?? 0)?.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR;
    });

    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.ACCOUNT_MOVED_TO_TOP_BAR,
        isFocused,
    );

    const navigateToAccount = () => {
        hideProductTrainingTooltip();
        if (isSelected) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS);
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
          }
        : {text: translate('initialSettingsPage.account')};

    return (
        <TooltipToRender {...tooltipProps}>
            <PressableWithoutFeedback
                onPress={navigateToAccount}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={`${translate('initialSettingsPage.account')}. ${status ? `${translate('common.yourReviewIsRequired')}.` : ''}`}
                style={[styles.flexRow, styles.touchableButtonImage]}
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

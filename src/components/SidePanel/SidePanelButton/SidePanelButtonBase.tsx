import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

import type SidePanelButtonProps from './types';

function SidePanelButtonBase({style}: SidePanelButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldHideHelpButton} = useSidePanelState();
    const {openSidePanel} = useSidePanelActions();
    const {isBetaEnabled} = usePermissions();
    const {ConciergeAvatar} = useMemoizedLazyExpensifyIcons(['ConciergeAvatar']);
    const {Concierge} = useMemoizedLazyIllustrations(['Concierge']);

    const shouldUseConciergeIllustration = isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);

    if (shouldHideHelpButton) {
        return null;
    }

    return (
        <Tooltip text={translate('common.help')}>
            <PressableWithoutFeedback
                sentryLabel={CONST.SENTRY_LABEL.SIDE_PANEL.HELP}
                accessibilityLabel={translate('common.help')}
                style={[styles.flexRow, styles.touchableButtonImage, style]}
                onPress={openSidePanel}
            >
                {shouldUseConciergeIllustration ? (
                    <Icon
                        src={Concierge}
                        width={variables.iconSizeExtraLarge}
                        height={variables.iconSizeExtraLarge}
                    />
                ) : (
                    <Icon
                        src={ConciergeAvatar}
                        fill={theme.icon}
                        width={variables.iconSizeXLarge}
                        height={variables.iconSizeXLarge}
                    />
                )}
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default SidePanelButtonBase;

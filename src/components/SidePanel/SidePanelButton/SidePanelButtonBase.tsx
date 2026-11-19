import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import type SidePanelButtonProps from './types';

import ConciergePageButton from './ConciergePageButton';

function SidePanelButtonBase({style}: SidePanelButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldHideHelpButton} = useSidePanelState();
    const {openSidePanel} = useSidePanelActions();
    const {Concierge} = useMemoizedLazyExpensifyIcons(['Concierge']);
    const {isBetaEnabled} = usePermissions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldOpenConciergePage = shouldUseNarrowLayout && isBetaEnabled(CONST.BETAS.FLAT_NAV);
    if (shouldHideHelpButton) {
        return null;
    }

    if (shouldOpenConciergePage) {
        return <ConciergePageButton style={style} />;
    }

    return (
        <Tooltip text={translate('common.help')}>
            <PressableWithoutFeedback
                sentryLabel={CONST.SENTRY_LABEL.SIDE_PANEL.HELP}
                accessibilityLabel={translate('common.help')}
                role={CONST.ROLE.BUTTON}
                style={[styles.flexRow, styles.touchableButtonImage, style]}
                onPress={openSidePanel}
            >
                <Icon
                    src={Concierge}
                    fill={theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default SidePanelButtonBase;

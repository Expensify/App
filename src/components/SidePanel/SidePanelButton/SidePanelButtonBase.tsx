import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
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
    const {Concierge} = useMemoizedLazyExpensifyIcons(['Concierge']);

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
                <Icon
                    src={Concierge}
                    fill={theme.icon}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default SidePanelButtonBase;

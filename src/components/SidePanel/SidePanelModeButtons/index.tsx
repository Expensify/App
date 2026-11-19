/**
 * Header button that moves the side panel between docked and floating.
 * Docked shows "pop out", floating shows "dock to side".
 */
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type {SidePanelMode} from '@components/SidePanel/SidePanelContextProvider';
import Tooltip from '@components/Tooltip';

import useIsInSidePanel from '@hooks/useIsInSidePanel';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';

type ModeButton = {
    targetMode: SidePanelMode;
    icon: IconAsset;
    label: TranslationPaths;
    sentryLabel: SentryLabel;
};

function SidePanelModeButtons() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Expand', 'NewWindow']);
    const isInSidePanel = useIsInSidePanel();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {sidePanelMode} = useSidePanelState();
    const {setSidePanelMode} = useSidePanelActions();

    if (!isInSidePanel || shouldUseNarrowLayout) {
        return null;
    }

    const buttons: ModeButton[] =
        sidePanelMode === 'floating'
            ? [
                  {
                      targetMode: 'docked',
                      icon: icons.Expand,
                      label: 'common.dockToSide',
                      sentryLabel: CONST.SENTRY_LABEL.SIDE_PANEL.DOCK_BUTTON,
                  },
              ]
            : [
                  {
                      targetMode: 'floating',
                      icon: icons.NewWindow,
                      label: 'common.popOut',
                      sentryLabel: CONST.SENTRY_LABEL.SIDE_PANEL.POP_OUT_BUTTON,
                  },
              ];

    return buttons.map(({targetMode, icon, label, sentryLabel}) => (
        <Tooltip
            key={targetMode}
            text={translate(label)}
        >
            <PressableWithoutFeedback
                onPress={() => setSidePanelMode(targetMode)}
                style={[styles.sidePanelHeaderButton]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate(label)}
                sentryLabel={sentryLabel}
            >
                <Icon
                    src={icon}
                    fill={theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    ));
}

export default SidePanelModeButtons;

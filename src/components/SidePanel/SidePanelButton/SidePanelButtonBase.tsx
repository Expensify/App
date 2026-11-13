import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

import type SidePanelButtonProps from './types';

function SidePanelButtonBase({style}: SidePanelButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldHideHelpButton} = useSidePanelState();
    const {openSidePanel} = useSidePanelActions();
    const {Concierge} = useMemoizedLazyExpensifyIcons(['Concierge']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    // A narrow side panel fills the screen anyway, so the button opens the Concierge chat itself rather than a
    // panel standing in for it.
    const openConcierge = () => {
        if (shouldUseNarrowLayout && conciergeReportID) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(conciergeReportID));
            return;
        }
        openSidePanel();
    };

    if (shouldHideHelpButton) {
        return null;
    }

    return (
        <Tooltip text={translate('common.help')}>
            <PressableWithoutFeedback
                sentryLabel={CONST.SENTRY_LABEL.SIDE_PANEL.HELP}
                accessibilityLabel={translate('common.help')}
                role={CONST.ROLE.BUTTON}
                style={[styles.flexRow, styles.touchableButtonImage, style]}
                onPress={openConcierge}
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

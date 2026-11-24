/**
 * Header button that moves the chat open in the side panel to the full Inbox view.
 */
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';

import useIsInSidePanel from '@hooks/useIsInSidePanel';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type SidePanelExpandButtonProps = {
    /** The report open in the side panel. */
    reportID: string | undefined;
};

function SidePanelExpandButton({reportID}: SidePanelExpandButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Expand']);
    const isInSidePanel = useIsInSidePanel();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isSidePanelResizable} = useSidePanelState();
    const {closeSidePanel} = useSidePanelActions();
    const focusedReportID = useRootNavigationState((state) => Navigation.getFocusedReportId(state));

    if (!isInSidePanel || shouldUseNarrowLayout || !isSidePanelResizable || !reportID || focusedReportID === reportID) {
        return null;
    }

    const expandToInbox = () => {
        closeSidePanel();
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
    };

    return (
        <Tooltip text={translate('common.expand')}>
            <PressableWithoutFeedback
                onPress={expandToInbox}
                style={[styles.touchableButtonImage]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('common.expand')}
                sentryLabel={CONST.SENTRY_LABEL.HEADER_VIEW.EXPAND_BUTTON}
            >
                <Icon
                    src={icons.Expand}
                    fill={theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default SidePanelExpandButton;

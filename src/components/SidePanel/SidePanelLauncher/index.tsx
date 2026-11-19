/**
 * The minimized side panel: a Concierge avatar bubble in the page's bottom-right corner that reopens the floating panel.
 */
import UserAvatar from '@components/Avatar/UserAvatar';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelReportID from '@hooks/useSidePanelReportID';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isUnread} from '@libs/ReportUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';
// @ts-expect-error The launcher floats above the whole app, the same way SidePanelModal does
import ModalPortal from 'react-native-web/dist/exports/Modal/ModalPortal';

import useSidePanelFloatingRight from '../useSidePanelFloatingRight';

function SidePanelLauncher() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {setSidePanelMode} = useSidePanelActions();
    const launcherRight = useSidePanelFloatingRight(variables.componentSizeLarge, variables.sidePanelLauncherInset);
    const reportID = useSidePanelReportID();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    // The panel's chat is unmounted while minimized, so a reply that arrives now stays unread until the panel reopens.
    const hasUnreadMessage = isUnread(report, undefined, false, undefined);

    return (
        <ModalPortal>
            <Tooltip text={translate('common.expand')}>
                <PressableWithoutFeedback
                    onPress={() => setSidePanelMode('floating')}
                    style={[styles.sidePanelContainer, styles.sidePanelLauncher(launcherRight)]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.expand')}
                    sentryLabel={CONST.SENTRY_LABEL.SIDE_PANEL.LAUNCHER}
                >
                    <UserAvatar
                        source={CONST.CONCIERGE_ICON_URL}
                        accountID={CONST.ACCOUNT_ID.CONCIERGE}
                        size={CONST.AVATAR_SIZE.X_LARGE}
                    />
                    {hasUnreadMessage && <View style={[styles.statusIndicator, styles.statusIndicatorColor(theme.success), styles.sidePanelLauncherIndicator()]} />}
                </PressableWithoutFeedback>
            </Tooltip>
        </ModalPortal>
    );
}

export default SidePanelLauncher;

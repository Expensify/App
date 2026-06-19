import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSidePanelState from '@hooks/useSidePanelState';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SidePanelButtonProps from './types';

function SidePanelButton({style}: SidePanelButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldHideHelpButton} = useSidePanelState();
    const {accountID: currentUserAccountID = CONST.DEFAULT_NUMBER_ID} = useCurrentUserPersonalDetails();
    const {ConciergeAvatar} = useMemoizedLazyExpensifyIcons(['ConciergeAvatar']);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    if (shouldHideHelpButton) {
        return null;
    }

    return (
        <Tooltip text={translate('common.help')}>
            <PressableWithoutFeedback
                sentryLabel={CONST.SENTRY_LABEL.SIDE_PANEL.HELP}
                accessibilityLabel={translate('common.help')}
                style={[styles.flexRow, styles.touchableButtonImage, style]}
                onPress={() => navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas)}
            >
                <Icon
                    src={ConciergeAvatar}
                    width={28}
                    height={28}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default SidePanelButton;

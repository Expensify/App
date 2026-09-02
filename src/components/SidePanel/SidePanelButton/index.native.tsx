import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSidePanelState from '@hooks/useSidePanelState';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import {navigateToConciergeChat} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';

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
                onPress={() => {
                    // Capture the report the user is viewing (still topmost at press time) so Concierge can act on it
                    // after we navigate away. This is the ONLY entry that threads a source report, so context is
                    // scoped to Concierge opened via this sidebar button — search/LHN/deep links never carry it.
                    const sourceReportID = Navigation.getTopmostReportId();
                    navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, undefined, undefined, undefined, {
                        sourceReportID: sourceReportID && sourceReportID !== conciergeReportID ? sourceReportID : undefined,
                    });
                }}
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

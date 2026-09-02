import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useSidePanelState from '@hooks/useSidePanelState';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import type {AnchorPosition} from '@styles/index';

import {navigateToConciergeChat} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {View} from 'react-native';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useRef, useState} from 'react';

import type SidePanelButtonProps from './types';

function SidePanelButton({style}: SidePanelButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldHideHelpButton} = useSidePanelState();
    const {accountID: currentUserAccountID = CONST.DEFAULT_NUMBER_ID} = useCurrentUserPersonalDetails();
    const {QuestionMark, Sparkles} = useMemoizedLazyExpensifyIcons(['QuestionMark', 'Sparkles']);
    const {calculatePopoverPosition} = usePopoverPosition();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const buttonRef = useRef<View | HTMLDivElement | null>(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    // Measured from the button so the menu opens directly below it, rather than at a fixed position.
    const [popoverPosition, setPopoverPosition] = useState<AnchorPosition>();

    if (shouldHideHelpButton) {
        return null;
    }

    const openMenu = () => {
        calculatePopoverPosition(buttonRef, {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
        }).then((position) => {
            setPopoverPosition(position);
            setIsMenuVisible(true);
        });
    };

    const menuItems = [
        {
            text: translate('initialSettingsPage.helpPage.askConcierge'),
            icon: Sparkles,
            onSelected: () => navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas),
        },
        {
            text: translate('initialSettingsPage.helpPage.title'),
            icon: QuestionMark,
            onSelected: () => Navigation.navigate(ROUTES.SETTINGS_HELP),
        },
    ];

    return (
        <>
            <Tooltip text={translate('common.help')}>
                <PressableWithoutFeedback
                    ref={buttonRef}
                    sentryLabel={CONST.SENTRY_LABEL.SIDE_PANEL.HELP}
                    accessibilityLabel={translate('common.help')}
                    style={[styles.flexRow, styles.touchableButtonImage, style]}
                    onPress={openMenu}
                >
                    <Icon
                        src={QuestionMark}
                        fill={theme.icon}
                    />
                </PressableWithoutFeedback>
            </Tooltip>
            <PopoverMenu
                isVisible={isMenuVisible}
                onClose={() => setIsMenuVisible(false)}
                onItemSelected={() => setIsMenuVisible(false)}
                anchorRef={buttonRef}
                anchorPosition={popoverPosition ?? {horizontal: 0, vertical: 0}}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                menuItems={menuItems}
            />
        </>
    );
}

export default SidePanelButton;

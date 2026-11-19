/** The Concierge controls on the right of the report header: a new conversation button, and the button that opens the list of Concierge conversations. */
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import useConciergeHeaderPlacement from '@hooks/useConciergeHeaderPlacement';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import {openConciergeConversation} from '@userActions/ConciergeThreads';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {CommonActions, useNavigation} from '@react-navigation/native';
import React from 'react';

import ConciergeHistoryButton from './ConciergeHistoryButton';

type ConciergeHeaderActionsProps = {
    /** The report the header shows */
    reportID: string | undefined;
};

function ConciergeHeaderActions({reportID}: ConciergeHeaderActionsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const navigation = useNavigation();
    const {closeSidePanel} = useSidePanelActions();
    // The side panel is narrow on every screen, so only the window width tells whether the Concierge page shows its list beside the chat
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isInNarrowConciergePage, isInConciergeSidePanel} = useConciergeHeaderPlacement(reportID);

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeChat = !!conciergeReportID && reportID === conciergeReportID;

    // The list goes on top of this chat, so its back button returns here
    const openConciergeHistory = () => {
        navigation.dispatch((state) =>
            CommonActions.reset({
                ...state,
                routes: [...state.routes, {name: SCREENS.CONCIERGE_SIDEBAR, key: `${SCREENS.CONCIERGE_SIDEBAR}-${Date.now()}`}],
                index: state.routes.length,
            }),
        );
    };

    const openConciergePageFromSidePanel = () => {
        closeSidePanel();
        // Wide layouts already show the list beside the new chat
        if (!isSmallScreenWidth) {
            openConciergeConversation(conciergeReportID);
            return;
        }
        Navigation.navigate(ROUTES.CONCIERGE_CHATS);
    };

    return (
        <>
            {isInNarrowConciergePage && !isConciergeChat && (
                <Tooltip text={translate('common.concierge.newChat')}>
                    <PressableWithoutFeedback
                        onPress={() => openConciergeConversation(conciergeReportID)}
                        style={[styles.touchableButtonImage]}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.concierge.newChat')}
                        sentryLabel={CONST.SENTRY_LABEL.HEADER_VIEW.CONCIERGE_NEW_CHAT_ICON_BUTTON}
                    >
                        <Icon
                            src={icons.Plus}
                            fill={theme.icon}
                        />
                    </PressableWithoutFeedback>
                </Tooltip>
            )}
            {(isInNarrowConciergePage || isInConciergeSidePanel) && (
                <ConciergeHistoryButton
                    onPress={isInConciergeSidePanel ? openConciergePageFromSidePanel : openConciergeHistory}
                    canShowProductTrainingTooltip={isInNarrowConciergePage}
                />
            )}
        </>
    );
}

export default ConciergeHeaderActions;

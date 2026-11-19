import Tooltip from '@components/Tooltip';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';

import Navigation from '@libs/Navigation/Navigation';

import {openConciergeConversation} from '@userActions/ConciergeThreads';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

import ConciergeHistoryButton from './ConciergeHistoryButton';

/** The history button in the header of a Concierge conversation in the side panel, which closes the panel and opens the Concierge page */
function ConciergeSidePanelHistoryButton() {
    const {translate} = useLocalize();
    const {closeSidePanel} = useSidePanelActions();
    // The side panel is narrow on every screen, so only the window width tells whether the Concierge page shows its list beside the chat
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const openConciergePage = () => {
        closeSidePanel();
        // Wide layouts already show the list beside the new chat
        if (!isSmallScreenWidth) {
            openConciergeConversation(conciergeReportID);
            return;
        }
        Navigation.navigate(ROUTES.CONCIERGE_CHATS);
    };

    return (
        <Tooltip text={translate('common.concierge.viewChatHistory')}>
            <ConciergeHistoryButton onPress={openConciergePage} />
        </Tooltip>
    );
}

export default ConciergeSidePanelHistoryButton;

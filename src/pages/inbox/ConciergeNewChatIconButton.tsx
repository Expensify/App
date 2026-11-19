import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {openConciergeConversation} from '@userActions/ConciergeThreads';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

/** The button in the header of a Concierge conversation that starts a new conversation with Concierge */
function ConciergeNewChatIconButton() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    return (
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
    );
}

export default ConciergeNewChatIconButton;

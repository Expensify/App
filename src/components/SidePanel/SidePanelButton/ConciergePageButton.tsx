import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import useConciergeConversationToOpen from '@hooks/useConciergeConversationToOpen';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {openConciergeConversation} from '@userActions/ConciergeThreads';

import CONST from '@src/CONST';

import React from 'react';

import type SidePanelButtonProps from './types';

/** The help button with the flat navigation, which opens the Concierge page on its most recent unread conversation, or on a new one */
function ConciergePageButton({style}: SidePanelButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {Concierge} = useMemoizedLazyExpensifyIcons(['Concierge']);
    const findOrCreateConciergeConversation = useConciergeConversationToOpen();

    return (
        <Tooltip text={translate('common.help')}>
            <PressableWithoutFeedback
                sentryLabel={CONST.SENTRY_LABEL.SIDE_PANEL.HELP}
                accessibilityLabel={translate('common.help')}
                role={CONST.ROLE.BUTTON}
                style={[styles.flexRow, styles.touchableButtonImage, style]}
                onPress={() => openConciergeConversation(findOrCreateConciergeConversation())}
            >
                <Icon
                    src={Concierge}
                    fill={theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default ConciergePageButton;

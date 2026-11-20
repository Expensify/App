import {PressableWithoutFeedback} from '@components/Pressable';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import ConciergeHistoryIcon from './ConciergeHistoryIcon';

type ConciergeHistoryButtonProps = {
    /** Opens the list of Concierge conversations */
    onPress: () => void;
};

/** The history button in a Concierge header, which opens the list of Concierge conversations */
function ConciergeHistoryButton({onPress}: ConciergeHistoryButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <PressableWithoutFeedback
            onPress={onPress}
            style={[styles.touchableButtonImage]}
            role={CONST.ROLE.BUTTON}
            accessibilityLabel={translate('common.concierge.viewChatHistory')}
            sentryLabel={CONST.SENTRY_LABEL.HEADER_VIEW.CONCIERGE_HISTORY_BUTTON}
        >
            <ConciergeHistoryIcon />
        </PressableWithoutFeedback>
    );
}

export default ConciergeHistoryButton;

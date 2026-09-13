import Button from '@components/Button';

import useConciergeAskState from '@hooks/useConciergeAskState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {useConciergeSessionActions} from '@pages/inbox/ConciergeSessionContext';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ConciergeChatHistoryToggleProps = {
    /** The ID of the report being displayed */
    reportID: string;

    /** Whether there are messages hidden before the session start */
    hasPreviousMessages: boolean;

    /** Whether the earlier conversation is currently shown */
    shouldShowFullHistory: boolean;

    /** Callback to reveal the earlier conversation */
    onShowPreviousMessages: () => void;

    /** Styles applied to the row wrapping the divider and the button */
    containerStyles?: StyleProp<ViewStyle>;
};

/**
 * Expands and collapses the earlier Concierge conversation in the main Concierge DM. It sits directly
 * above the composer, either in the welcome column or in the inverted list's header.
 */
function ConciergeChatHistoryToggle({reportID, hasPreviousMessages, shouldShowFullHistory, onShowPreviousMessages, containerStyles}: ConciergeChatHistoryToggleProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['UpArrow', 'DownArrow']);
    const {shouldShowWelcome, shouldLabelComposerAsNewQuestion} = useConciergeAskState(reportID);
    const {setShowFullHistory} = useConciergeSessionActions();

    const hideChatHistory = () => setShowFullHistory(false);

    // Both flags are false once the user asks something, which is when this control would otherwise
    // land between the latest message and the composer.
    if (!shouldShowWelcome && !shouldLabelComposerAsNewQuestion) {
        return null;
    }

    if (!hasPreviousMessages) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.pv3, styles.mh5, containerStyles]}>
            <View style={[styles.threadDividerLine, styles.ml0, styles.mr0, styles.flexGrow1]} />
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={shouldShowFullHistory ? hideChatHistory : onShowPreviousMessages}
            >
                <Button.Text>{translate(shouldShowFullHistory ? 'common.concierge.hideChatHistory' : 'common.concierge.viewChatHistory')}</Button.Text>
                <Button.Icon src={shouldShowFullHistory ? expensifyIcons.DownArrow : expensifyIcons.UpArrow} />
            </Button>
            <View style={[styles.threadDividerLine, styles.ml0, styles.mr0, styles.flexGrow1]} />
        </View>
    );
}

export default ConciergeChatHistoryToggle;

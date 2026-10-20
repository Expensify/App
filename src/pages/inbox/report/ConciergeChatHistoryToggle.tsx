import Button from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {useConciergeChatHistoryActions} from '@pages/inbox/ConciergeChatHistoryContext';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ConciergeChatHistoryToggleProps = {
    /** Whether the chat has earlier messages to show */
    hasPreviousMessages: boolean;

    /** Whether the earlier conversation is currently shown */
    shouldShowFullHistory: boolean;

    /** Callback to reveal the earlier conversation */
    onShowPreviousMessages: () => void;

    /** Styles applied to the row wrapping the divider and the button */
    containerStyles?: StyleProp<ViewStyle>;
};

function ConciergeChatHistoryToggle({hasPreviousMessages, shouldShowFullHistory, onShowPreviousMessages, containerStyles}: ConciergeChatHistoryToggleProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['UpArrow', 'DownArrow']);
    const {setShowFullHistory} = useConciergeChatHistoryActions();

    const hideChatHistory = () => setShowFullHistory(false);

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

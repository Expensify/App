import Button from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ConciergeChatHistoryToggleProps = {
    /** Whether the earlier conversation is shown */
    isHistoryShown: boolean;

    /** Called when the button is pressed */
    onPress: () => void;

    /** Styles applied to the row wrapping the divider and the button */
    containerStyles?: StyleProp<ViewStyle>;
};

function ConciergeChatHistoryToggle({isHistoryShown, onPress, containerStyles}: ConciergeChatHistoryToggleProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['UpArrow', 'DownArrow']);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.pv3, styles.mh5, containerStyles]}>
            <View style={[styles.threadDividerLine, styles.ml0, styles.mr0, styles.flexGrow1]} />
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={onPress}
            >
                <Button.Text>{translate(isHistoryShown ? 'common.concierge.hideChatHistory' : 'common.concierge.viewChatHistory')}</Button.Text>
                <Button.Icon src={isHistoryShown ? expensifyIcons.DownArrow : expensifyIcons.UpArrow} />
            </Button>
            <View style={[styles.threadDividerLine, styles.ml0, styles.mr0, styles.flexGrow1]} />
        </View>
    );
}

export default ConciergeChatHistoryToggle;

import React from 'react';
import type {ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import useIsInFocusMode from '@hooks/useIsInFocusMode';
import useThemeStyles from '@hooks/useThemeStyles';

function OptionRowLHNDataBody({children}: {children: React.ReactNode}) {
    const isInFocusMode = useIsInFocusMode();
    const styles = useThemeStyles();
    const sidebarInnerRowStyle = StyleSheet.flatten<ViewStyle>(
        isInFocusMode
            ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
            : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter],
    );

    return <View style={sidebarInnerRowStyle}>{children}</View>;
}

export default OptionRowLHNDataBody;

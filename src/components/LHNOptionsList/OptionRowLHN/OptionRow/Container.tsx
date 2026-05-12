import React from 'react';
import type {ReactNode} from 'react';
import type {ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type OptionMode = ValueOf<typeof CONST.OPTION_MODE>;

type ContainerProps = {
    viewMode: OptionMode;
    children: ReactNode;
};

type ContentProps = {
    viewMode: OptionMode;
    children: ReactNode;
};

function Container({viewMode, children}: ContainerProps) {
    const styles = useThemeStyles();
    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const sidebarInnerRowStyle = StyleSheet.flatten<ViewStyle>(
        isInFocusMode
            ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
            : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter],
    );

    return (
        <View style={sidebarInnerRowStyle}>
            <View style={[styles.flexRow, styles.alignItemsCenter]}>{children}</View>
        </View>
    );
}

function Content({viewMode, children}: ContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const contentContainerStyles = isInFocusMode ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];

    return <View style={contentContainerStyles}>{children}</View>;
}

Container.displayName = 'OptionRow.Container';
Content.displayName = 'OptionRow.Container.Content';

Container.Content = Content;

export default Container;

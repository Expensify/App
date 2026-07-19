import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type WorkspaceExpensifyCardRowFooterProps = {
    /** Who froze the card and when */
    frozenByText: string;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;
};

/** The frozen-card status shown beneath a card's row. */
function WorkspaceExpensifyCardRowFooter({frozenByText, shouldUseNarrowTableLayout}: WorkspaceExpensifyCardRowFooterProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['FreezeCard']);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt1]}>
            <Icon
                src={icons.FreezeCard}
                fill={theme.icon}
                size={CONST.ICON_SIZE.SMALL}
            />
            <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.textLabelSupporting, styles.colorMuted, styles.ml2, styles.flexShrink1, shouldUseNarrowTableLayout ? styles.lh16 : styles.textMicro]}
            >
                {frozenByText}
            </Text>
        </View>
    );
}

WorkspaceExpensifyCardRowFooter.displayName = 'WorkspaceExpensifyCardRowFooter';

export default WorkspaceExpensifyCardRowFooter;

import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Badge from './Badge';
import Text from './Text';

type MoneyRequestHeaderStatusBarProps = {
    /** Title displayed in badge */
    title: string | ReactNode;

    /** Banner Description */
    description: string;

    /** Whether we should use the danger theme color */
    danger?: boolean;

    /** Whether we style flex grow */
    shouldStyleFlexGrow?: boolean;
};

function MoneyRequestHeaderStatusBar({title, description, danger = false, shouldStyleFlexGrow = true}: MoneyRequestHeaderStatusBarProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, shouldStyleFlexGrow && styles.flexGrow1, styles.overflowHidden, styles.headerStatusBarContainer]}>
            {typeof title === 'string' ? (
                <View style={[styles.mr3]}>
                    <Badge
                        text={title}
                        badgeStyles={styles.ml0}
                        error={danger}
                    />
                </View>
            ) : (
                <View style={styles.mr2}>{title}</View>
            )}
            <View style={[styles.flexShrink1]}>
                <Text style={[styles.textLabelSupporting]}>{description}</Text>
            </View>
        </View>
    );
}

MoneyRequestHeaderStatusBar.displayName = 'MoneyRequestHeaderStatusBar';

export default MoneyRequestHeaderStatusBar;

export type {MoneyRequestHeaderStatusBarProps};

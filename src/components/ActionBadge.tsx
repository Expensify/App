import React from 'react';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';

type ActionBadgeProps = {
    /** The action verb to display (e.g., "Submit", "Approve", "Pay", "Export") */
    verb: string;

    /** Whether the badge should be displayed in error state (red) */
    isError?: boolean;
};

function ActionBadge({verb, isError = false}: ActionBadgeProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const badgeColor = isError ? theme.danger : theme.success;

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <View
                style={[
                    styles.actionBadgeDot,
                    {backgroundColor: badgeColor},
                ]}
            />
            <Text style={[styles.actionBadgeText, {color: badgeColor}]}>{verb}</Text>
        </View>
    );
}

ActionBadge.displayName = 'ActionBadge';

export default ActionBadge;

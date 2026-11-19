import Badge from '@components/Badge';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type InsightsChangeBadgeProps = {
    text: string;

    isIncrease: boolean;

    /** Draws the badge gray in both directions, for changes that are neither good nor bad on their own */
    isNeutral?: boolean;

    style?: StyleProp<ViewStyle>;
};

/** Badge showing how a value changed, with an arrow when it went up or down */
function InsightsChangeBadge({text, isIncrease, isNeutral = false, style}: InsightsChangeBadgeProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong']);

    return (
        <View
            style={style}
            accessible
            accessibilityLabel={translate(isIncrease ? 'insightsPage.compare.increase' : 'insightsPage.compare.decrease', text)}
        >
            <Badge
                text={text}
                icon={isIncrease ? icons.ArrowUpLong : icons.ArrowDownLong}
                error={!isNeutral && isIncrease}
                success={!isNeutral && !isIncrease}
                badgeStyles={styles.ml0}
            />
        </View>
    );
}

export default InsightsChangeBadge;

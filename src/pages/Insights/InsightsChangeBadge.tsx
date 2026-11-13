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
    style?: StyleProp<ViewStyle>;
};

/** Badge with an arrow showing which way a value changed */
function InsightsChangeBadge({text, isIncrease, style}: InsightsChangeBadgeProps) {
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
                error={isIncrease}
                success={!isIncrease}
                badgeStyles={styles.ml0}
            />
        </View>
    );
}

export default InsightsChangeBadge;

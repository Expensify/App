import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

/**
 * Renders a Sparkles SVG icon as an inline custom HTML element <sparkles-icon/>
 */
function SparklesIconRenderer() {
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View>
            <Icon
                src={icons.Sparkles}
                width={variables.iconSizeExtraSmall}
                height={variables.iconSizeExtraSmall}
                fill={theme.link}
                additionalStyles={[styles.mlHalf]}
            />
        </View>
    );
}

export default SparklesIconRenderer;

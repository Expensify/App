import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type RedDotCardSectionProps = {
    title: string;
    description: string;
};

function RedDotCardSection({title, description}: RedDotCardSectionProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    return (
        <View style={[styles.p5, styles.flexRow, styles.alignItemsStart]}>
            {/* The top margin centers the dot on the title's first line */}
            <View style={[styles.offlineFeedbackErrorDot, styles.mt1]}>
                <Icon
                    src={icons.DotIndicator}
                    size={CONST.ICON_SIZE.EXTRA_SMALL}
                    fill={theme.danger}
                />
            </View>
            <View style={[styles.flexRow, styles.flexShrink1]}>
                <View style={styles.flexShrink1}>
                    <Text style={[styles.walletRedDotSectionTitle, styles.mb1]}>{title}</Text>
                    <Text style={styles.walletRedDotSectionText}>{description}</Text>
                </View>
            </View>
        </View>
    );
}

export default RedDotCardSection;

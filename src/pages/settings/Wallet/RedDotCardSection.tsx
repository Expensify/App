import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type RedDotCardSectionProps = {
    title: string;
    description: string;
};

function RedDotCardSection({title, description}: RedDotCardSectionProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.p5, styles.flexRow, styles.alignItemsStart]}>
            <View style={styles.offlineFeedbackErrorDot}>
                <Icon
                    src={Expensicons.DotIndicator}
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

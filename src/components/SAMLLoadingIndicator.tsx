import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import Icon from './Icon';
import Text from './Text';

function SAMLLoadingIndicator() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['RocketBlue']);
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyWordmark']);
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.deeplinkWrapperContainer]}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={200}
                        height={164}
                        src={illustrations.RocketBlue}
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>{translate('samlSignIn.launching')}</Text>
                <View style={[styles.mt2, styles.mh2, styles.textAlignCenter]}>
                    <Text
                        style={[styles.textAlignCenter]}
                        fontSize={variables.fontSizeNormal}
                    >
                        {translate('samlSignIn.oneMoment')}
                    </Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={154}
                    height={34}
                    fill={theme.success}
                    src={icons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

export default SAMLLoadingIndicator;

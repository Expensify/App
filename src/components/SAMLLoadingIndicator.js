import React from 'react';
import {StyleSheet, View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import * as Illustrations from './Icon/Illustrations';
import Text from './Text';

function SAMLLoadingIndicator() {
    const {translate} = useLocalize();
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.deeplinkWrapperContainer]}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={200}
                        height={164}
                        src={Illustrations.RocketBlue}
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>{translate('samlSignIn.launching')}</Text>
                <View style={[styles.mt2, styles.mh2, styles.fontSizeNormal, styles.textAlignCenter]}>
                    <Text style={[styles.textAlignCenter]}>{translate('samlSignIn.oneMoment')}</Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={154}
                    height={34}
                    fill={themeColors.success}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

SAMLLoadingIndicator.displayName = 'SAMLLoadingIndicator';

export default SAMLLoadingIndicator;

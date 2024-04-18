import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';


function ConnectionCompletePage() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Lottie
                        source={LottieAnimations.Desk}
                        style={{width:variables.modalTopIconWidth, height:variables.modalTopBigIconHeight}}
                        webStyle={{width:variables.modalTopIconWidth, height:variables.modalTopBigIconHeight}}
                        autoPlay
                        loop
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>
                    {translate('connectionComplete.title')}
                </Text>
                <View style={[styles.mt2, styles.mb2, {maxWidth: 280}]}>
                    <Text style={styles.textAlignCenter}>{translate('connectionComplete.supportingText')}</Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={variables.modalWordmarkWidth}
                    height={variables.modalWordmarkHeight}
                    fill={theme.success}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

ConnectionCompletePage.displayName = 'ConnectionCompletePage';

export default ConnectionCompletePage;

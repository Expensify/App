import React from 'react';
import {StyleSheet, View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import FullPageOfflineBlockingView from './BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from './HeaderWithBackButton';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import ScreenWrapper from './ScreenWrapper';
import Text from './Text';

type ReimbursementAccountLoadingIndicatorProps = {
    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: () => void;
};

function ReimbursementAccountLoadingIndicator({onBackButtonPress}: ReimbursementAccountLoadingIndicatorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            style={[StyleSheet.absoluteFillObject, styles.reimbursementAccountFullScreenLoading]}
            testID="ReimbursementAccountLoadingIndicator"
        >
            <HeaderWithBackButton
                title={translate('reimbursementAccountLoadingAnimation.oneMoment')}
                onBackButtonPress={onBackButtonPress}
            />
            <FullPageOfflineBlockingView>
                <View style={styles.pageWrapper}>
                    <Lottie
                        source={LottieAnimations.ReviewingBankInfo}
                        autoPlay
                        loop
                        style={styles.loadingVBAAnimation}
                        webStyle={styles.loadingVBAAnimationWeb}
                    />
                    <View style={styles.ph6}>
                        <Text style={styles.textAlignCenter}>{translate('reimbursementAccountLoadingAnimation.explanationLine')}</Text>
                    </View>
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default ReimbursementAccountLoadingIndicator;

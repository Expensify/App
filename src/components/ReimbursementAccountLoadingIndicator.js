import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import FullPageOfflineBlockingView from './BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';
import HeaderWithBackButton from './HeaderWithBackButton';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import ScreenWrapper from './ScreenWrapper';
import Text from './Text';

const propTypes = {
    /** Whether the user is submitting verifications data */
    isSubmittingVerificationsData: PropTypes.bool.isRequired,

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func.isRequired,
};

function ReimbursementAccountLoadingIndicator(props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            style={[StyleSheet.absoluteFillObject, styles.reimbursementAccountFullScreenLoading]}
            testID={ReimbursementAccountLoadingIndicator.displayName}
        >
            <HeaderWithBackButton
                title={translate('reimbursementAccountLoadingAnimation.oneMoment')}
                onBackButtonPress={props.onBackButtonPress}
            />
            <FullPageOfflineBlockingView>
                {props.isSubmittingVerificationsData ? (
                    <View style={[styles.pageWrapper]}>
                        <Lottie
                            source={LottieAnimations.ReviewingBankInfo}
                            autoPlay
                            loop
                            style={styles.loadingVBAAnimation}
                            webStyle={styles.loadingVBAAnimationWeb}
                        />
                        <View style={[styles.ph6]}>
                            <Text style={[styles.textAlignCenter]}>{translate('reimbursementAccountLoadingAnimation.explanationLine')}</Text>
                        </View>
                    </View>
                ) : (
                    <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

ReimbursementAccountLoadingIndicator.propTypes = propTypes;
ReimbursementAccountLoadingIndicator.displayName = 'ReimbursementAccountLoadingIndicator';

export default ReimbursementAccountLoadingIndicator;

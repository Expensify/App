import React from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import Lottie from 'lottie-react-native';
import * as LottieAnimations from './LottieAnimations';
import styles from '../styles/styles';
import useLocalize from '../hooks/useLocalize';
import Text from './Text';
import HeaderWithBackButton from './HeaderWithBackButton';
import ScreenWrapper from './ScreenWrapper';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';
import FullPageOfflineBlockingView from './BlockingViews/FullPageOfflineBlockingView';

const propTypes = {
    /** Whether the user is submitting verifications data */
    isSubmittingVerificationsData: PropTypes.bool.isRequired,

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func.isRequired,
};

function ReimbursementAccountLoadingIndicator(props) {
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

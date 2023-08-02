import React from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import Lottie from 'lottie-react-native';
import * as LottieAnimations from './LottieAnimations';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Text from './Text';
import HeaderWithBackButton from './HeaderWithBackButton';
import ScreenWrapper from './ScreenWrapper';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';
import FullPageOfflineBlockingView from './BlockingViews/FullPageOfflineBlockingView';
import compose from '../libs/compose';
import {withNetwork} from './OnyxProvider';

const propTypes = {
    /** Whether the user is submitting verifications data */
    isSubmittingVerificationsData: PropTypes.bool.isRequired,

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func.isRequired,
    ...withLocalizePropTypes,
};

function ReimbursementAccountLoadingIndicator(props) {
    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            style={[StyleSheet.absoluteFillObject, styles.reimbursementAccountFullScreenLoading]}
        >
            <HeaderWithBackButton
                title={props.translate('reimbursementAccountLoadingAnimation.oneMoment')}
                onBackButtonPress={props.onBackButtonPress}
            />
            <FullPageOfflineBlockingView>
                {props.isSubmittingVerificationsData ? (
                    <View style={[styles.pageWrapper]}>
                        <Lottie
                            source={LottieAnimations.ReviewingBankInfoAnimation}
                            autoPlay
                            loop
                            style={styles.loadingVBAAnimation}
                        />
                        <View style={[styles.ph6]}>
                            <Text style={[styles.textAlignCenter]}>{props.translate('reimbursementAccountLoadingAnimation.explanationLine')}</Text>
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

export default compose(withLocalize, withNetwork())(ReimbursementAccountLoadingIndicator);

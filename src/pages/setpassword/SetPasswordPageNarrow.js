import React from 'react';
import {
    SafeAreaView,
    View,
    Image,
} from 'react-native';
import withOnyx from 'react-native-onyx/lib/withOnyx';
import styles from '../../styles/styles';
import SignInPageLayout from '../signin/SignInPageLayout';
import WelcomeText from '../../components/WelcomeText';
import ONYXKEYS from '../../ONYXKEYS';
import SetPasswordForm from './SetPasswordForm';
import welcomeScreenshot from '../../../assets/images/welcome-screenshot-wide.png';
import setPasswordPagePropTypes from './setPasswordPagePropTypes';

const SetPasswordPageNarrow = props => (
    <SafeAreaView style={[styles.signInPage]}>
        <SignInPageLayout>
            <View style={[styles.loginFormContainer]}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <SetPasswordForm {...props} />
                <View style={[styles.mt5, styles.mb5]}>
                    <Image
                        resizeMode="contain"
                        style={[styles.signinWelcomeScreenshot]}
                        source={welcomeScreenshot}
                    />
                </View>
            </View>
            <WelcomeText />
        </SignInPageLayout>
    </SafeAreaView>
);

SetPasswordPageNarrow.propTypes = setPasswordPagePropTypes.propTypes;
SetPasswordPageNarrow.defaultProps = setPasswordPagePropTypes.defaultProps;

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
    account: {key: ONYXKEYS.ACCOUNT},
})(SetPasswordPageNarrow);

import React from 'react';
import {
    SafeAreaView,
    View,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import SignInPageLayout from '../signin/SignInPageLayout';
import WelcomeText from '../../components/WelcomeText';
import ONYXKEYS from '../../ONYXKEYS';
import setPasswordPagePropTypes from './setPasswordPagePropTypes';
import SetPasswordForm from './SetPasswordForm';

const SetPasswordPageWide = props => (
    <SafeAreaView style={[styles.signInPage]}>
        <SignInPageLayout>
            <View style={[styles.loginFormContainer]}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <SetPasswordForm {...props} />
            </View>
            <WelcomeText />
        </SignInPageLayout>
    </SafeAreaView>
);

SetPasswordPageWide.propTypes = setPasswordPagePropTypes.propTypes;
SetPasswordPageWide.defaultProps = setPasswordPagePropTypes.defaultProps;

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
    account: {key: ONYXKEYS.ACCOUNT},
})(SetPasswordPageWide);

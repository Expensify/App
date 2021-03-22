import React from 'react';
import {SafeAreaView} from 'react-native';
import styles from '../../styles/styles';
import SignInPageLayout from '../signin/SignInPageLayout';
import SetPasswordForm from './SetPasswordForm';
import SetPasswordPageProps from './SetPasswordPageProps';

const SetPasswordPage = props => (
    <SafeAreaView style={[styles.signInPage]}>
        <SignInPageLayout>
            <SetPasswordForm
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...props}
            />
        </SignInPageLayout>
    </SafeAreaView>
);

SetPasswordPage.propTypes = SetPasswordPageProps.propTypes;
SetPasswordPage.defaultProps = SetPasswordPageProps.defaultProps;

export default SetPasswordPage;

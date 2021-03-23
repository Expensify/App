import React from 'react';
import {SafeAreaView, Text, View, Image} from 'react-native';
import styles from '../../styles/styles';
import SignInPageLayout from '../signin/SignInPageLayout';
import SetPasswordPageProps from './SetPasswordPageProps';
import welcomeScreenshot from '../../../assets/images/welcome-screenshot.png';
import withWindowDimensions from '../../components/withWindowDimensions';
import SetPasswordForm from './SetPasswordForm';

const SetPasswordPage = (props) => {
    const welcomeText = (
        <View style={props.isSmallScreenWidth ? [] : [styles.mb6, styles.mt6]}>
            <Text style={[props.isSmallScreenWidth ? styles.textLabel : styles.textP, styles.textStrong, styles.mb1]}>
                With Expensify.cash, chat and payments are the same thing.
            </Text>
            <Text style={[props.isSmallScreenWidth ? styles.textLabel : styles.textP]}>
                Money talks. And now that chat and payments are in one place, it&apos;s also easy.
                {' '}
                Your payments get to you as fast as you can get your point across.
            </Text>
        </View>
    );
    return (
        <SafeAreaView style={[styles.signInPage]}>
            <SignInPageLayout>
                <View style={[styles.loginFormContainer]}>
                    <SetPasswordForm
                        /* eslint-disable-next-line react/jsx-props-no-spreading */
                        {...props}
                    />
                    {props.isSmallScreenWidth && (
                        <View style={[styles.mt5, styles.mb5]}>
                            <Image
                                resizeMode="contain"
                                style={[styles.signinWelcomeScreenshot]}
                                source={welcomeScreenshot}
                            />
                        </View>
                    )}
                </View>
                {welcomeText}
            </SignInPageLayout>
        </SafeAreaView>
    );
};

SetPasswordPage.propTypes = SetPasswordPageProps.propTypes;
SetPasswordPage.defaultProps = SetPasswordPageProps.defaultProps;

export default withWindowDimensions(SetPasswordPage);

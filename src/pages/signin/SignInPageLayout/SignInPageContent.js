import React from 'react';
import {View, TouchableWithoutFeedback, Keyboard} from 'react-native';
import PropTypes from 'prop-types';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import Text from '../../../components/Text';
import TermsAndLicenses from '../TermsAndLicenses';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import SignInPageForm from '../../../components/SignInPageForm';
import compose from '../../../libs/compose';
import withKeyboardState, {keyboardStatePropTypes} from '../../../components/withKeyboardState';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';

const propTypes = {
    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    /** Welcome text to show in the header of the form, changes depending
     * on form type (set password, sign in, etc.) */
    welcomeText: PropTypes.string.isRequired,

    /** Whether to show welcome text on a particular page */
    shouldShowWelcomeText: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
    ...keyboardStatePropTypes,
};

const SignInPageContent = (props) => {
    const dismissKeyboardWhenTappedOutsideOfInput = () => {
        if (!props.isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboardWhenTappedOutsideOfInput}>
            <View
                style={[
                    styles.flex1,
                    styles.signInPageLeftContainer,
                    !props.isSmallScreenWidth && styles.signInPageLeftContainerWide,
                ]}
            >
                <KeyboardAvoidingView
                    behavior="padding"
                    style={[styles.flex1, styles.alignSelfCenter, styles.signInPageWelcomeFormContainer]}

                    // This vertical offset is here to add some more margin above the keyboard. Without it, the TOS and footer stuff still hides behind the keyboard by a few pixels.
                    keyboardVerticalOffset={50}
                >
                    {/* This empty view creates margin on the top of the sign in form which will shrink and grow depending on if the keyboard is open or not */}
                    <View style={[styles.flexGrow1, styles.signInPageContentTopSpacer]} />

                    <View style={[styles.flexGrow2]}>
                        <SignInPageForm style={[styles.alignSelfStretch]}>
                            <View style={[
                                styles.componentHeightLarge,
                                ...(props.isSmallScreenWidth ? [styles.mb2] : [styles.mt6, styles.mb5]),
                            ]}
                            >
                                <ExpensifyCashLogo
                                    width={variables.componentSizeLarge}
                                    height={variables.componentSizeLarge}
                                />
                            </View>
                            {props.shouldShowWelcomeText && (
                                <View style={[styles.signInPageWelcomeTextContainer]}>
                                    <Text style={[styles.mv5, styles.textLabel, styles.h3]}>
                                        {props.welcomeText}
                                    </Text>
                                </View>
                            )}
                            {props.children}
                        </SignInPageForm>
                    </View>
                    <View style={[styles.mv5]}>
                        <TermsAndLicenses />
                    </View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
};

SignInPageContent.propTypes = propTypes;
SignInPageContent.displayName = 'SignInPageContent';

export default compose(
    withWindowDimensions,
    withLocalize,

    // KeyboardState HOC is needed to trigger recalculation of the UI when keyboard opens or closes
    withKeyboardState,
    withSafeAreaInsets,
)(SignInPageContent);

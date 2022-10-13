import React from 'react';
import {ScrollView, View, KeyboardAvoidingView} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import Text from '../../../components/Text';
import TermsAndLicenses from '../TermsAndLicenses';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import SignInPageForm from '../../../components/SignInPageForm';
import compose from '../../../libs/compose';
import scrollViewContentContainerStyles from './signInPageStyles';
import withKeyboardState from '../../../components/withKeyboardState';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

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
};

const SignInPageContent = props => (
    <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={[
            styles.h100,
            !props.isSmallScreenWidth && styles.alignSelfCenter,
            !props.isSmallScreenWidth && styles.signInPageWideLeftContainer,
        ]}
        contentContainerStyle={[
            scrollViewContentContainerStyles,
            styles.alignItemsCenter,
            !props.isSmallScreenWidth && styles.ph6,
        ]}
    >
        <View style={[styles.flex1, styles.flexRow]}>
            <View style={[
                styles.flex1,
                styles.signInPageNarrowContentContainer,
            ]}
            >
                <SignInPageForm style={[
                    styles.flex1,
                    styles.alignSelfStretch,
                    props.isSmallScreenWidth ? styles.ph5 : styles.ph4,
                ]}
                >
                    <KeyboardAvoidingView>
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
                            <Text style={[styles.mv5, styles.textLabel, styles.h3]}>
                                {props.welcomeText}
                            </Text>
                        )}
                        {props.children}
                    </KeyboardAvoidingView>
                </SignInPageForm>
                <View style={[styles.mb5, styles.alignSelfCenter, styles.ph5]}>
                    <TermsAndLicenses />
                </View>
            </View>
        </View>
    </ScrollView>
);

SignInPageContent.propTypes = propTypes;
SignInPageContent.displayName = 'SignInPageContent';

export default compose(
    withWindowDimensions,
    withLocalize,

    // KeyboardState HOC is needed to trigger recalculation of the UI when keyboard opens or closes
    withKeyboardState,
)(SignInPageContent);

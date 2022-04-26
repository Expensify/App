import React from 'react';
import {ScrollView, View} from 'react-native';
import PropTypes from 'prop-types';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import variables from '../../../styles/variables';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import Text from '../../../components/Text';
import TermsAndLicenses from '../TermsAndLicenses';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import SignInPageForm from '../../../components/SignInPageForm';
import compose from '../../../libs/compose';
import scrollViewContentContainerStyles from './signInPageStyles';
import LoginKeyboardAvoidingView from './LoginKeyboardAvoidingView';
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
            styles.alignSelfCenter,
            !props.isSmallScreenWidth && styles.signInPageWideLeftContainer,
        ]}
        contentContainerStyle={[
            scrollViewContentContainerStyles,
            !props.isSmallScreenWidth && styles.ph6,
        ]}
    >
        <SignInPageForm style={[
            styles.flex1,
            styles.alignSelfStretch,
            props.isSmallScreenWidth && styles.signInPageNarrowContentContainer,
            props.isSmallScreenWidth ? styles.ph5 : styles.ph4,
        ]}
        >
            <LoginKeyboardAvoidingView
                behavior="position"
                contentContainerStyle={[
                    props.isSmallScreenWidth && styles.signInPageNarrowContentMargin,
                    !props.isMediumScreenWidth && styles.signInPageWideLeftContentMargin,
                    styles.mb3,
                    StyleUtils.getModalPaddingStyles({
                        shouldAddBottomSafeAreaPadding: true,
                        modalContainerStylePaddingBottom: 20,
                        safeAreaPaddingBottom: props.insets.bottom,
                    }),
                ]}
            >
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
            </LoginKeyboardAvoidingView>
        </SignInPageForm>
        <View style={[styles.mb5, styles.alignSelfCenter, props.isSmallScreenWidth && styles.signInPageNarrowContentContainer, styles.ph5]}>
            <TermsAndLicenses />
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
    withSafeAreaInsets,
)(SignInPageContent);

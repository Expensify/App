import React from 'react';
import {ScrollView, View} from 'react-native';
import PropTypes from 'prop-types';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import Text from '../../../components/Text';
import TermsAndLicenses from '../TermsAndLicenses';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import SignInPageForm from '../../../components/SignInPageForm';
import compose from '../../../libs/compose';
import scrollViewContentContainerStyles from './signInPageStyles';
import withKeyboardState from '../../../components/withKeyboardState';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import * as StyleUtils from '../../../styles/StyleUtils';

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
                    <KeyboardAvoidingView
                        behavior="position"
                        style={[
                            StyleUtils.getModalPaddingStyles({
                                shouldAddBottomSafeAreaPadding: true,
                                modalContainerStylePaddingBottom: 20,
                                safeAreaPaddingBottom: props.insets.bottom,
                            }),
                            props.isSmallScreenWidth ? styles.signInPageNarrowContentMargin : {},
                            !props.isMediumScreenWidth || (props.isMediumScreenWidth && props.windowHeight < variables.minHeightToShowGraphics) ? styles.signInPageWideLeftContentMargin : {},
                            styles.mb3,
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
    withSafeAreaInsets,
)(SignInPageContent);

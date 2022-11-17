import React from 'react';
import {View} from 'react-native';
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
    <View
        style={[
            styles.flex1,
            styles.ph6,
            !props.isSmallScreenWidth && styles.signInPageWideLeftContainer,
        ]}
    >
        <View style={[styles.flexGrow1, {maxHeight: 132}]} />
        <View
            style={[
                styles.flexGrow2,
                !props.isSmallScreenWidth && styles.alignSelfCenter,
                {maxWidth: 375},
            ]}
        >
            <SignInPageForm style={[
                styles.alignSelfStretch,
                props.isSmallScreenWidth ? styles.ph5 : styles.ph4,
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
            </SignInPageForm>
        </View>
        <View style={[styles.mb3, styles.alignSelfCenter, styles.ph5]}>
            <TermsAndLicenses />
        </View>
    </View>
);

SignInPageContent.propTypes = propTypes;
SignInPageContent.displayName = 'SignInPageContent';

export default compose(
    withWindowDimensions,
    withLocalize,
    withSafeAreaInsets,
)(SignInPageContent);

import React from 'react';
import {ScrollView, View} from 'react-native';
import PropTypes from 'prop-types';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import SVGImage from '../../../components/SVGImage';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import ExpensifyText from '../../../components/ExpensifyText';
import variables from '../../../styles/variables';
import TermsAndLicenses from '../TermsAndLicenses';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import scrollViewContentContainerStyles from './signInPageStyles.js';
import LoginKeyboardAvoidingView from './LoginKeyboardAvoidingView';
import withKeyboardState from '../../../components/withKeyboardState';


const propTypes = {
    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    /** Welcome text to show in the header of the form, changes depending
     * on form type (set password, sign in, etc.) */
    welcomeText: PropTypes.string.isRequired,

    /* Flag to check medium screen with device */
    isMediumScreenWidth: PropTypes.bool.isRequired,

    /** Whether to show welcome text on a particular page */
    shouldShowWelcomeText: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
};

const backgroundStyle = StyleUtils.getLoginPagePromoStyle();

const SignInPageLayoutWide = props => (
    <View style={[styles.flex1, styles.signInPageInner]}>
        <View style={[styles.flex1, styles.flexRow, styles.flexGrow1]}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={[
                    styles.h100,
                    styles.alignSelfCenter,
                    styles.signInPageWideLeftContainer,
                ]}
                contentContainerStyle={[scrollViewContentContainerStyles, styles.ph6]}
            >
                <View style={[styles.flex1, styles.alignSelfStretch, styles.ph4]}>
                    <LoginKeyboardAvoidingView
                        behavior="position"
                        contentContainerStyle={[
                            styles.signInPageWideLeftContentMargin,
                            styles.mb3,
                            styles.getModalPaddingStyles({
                                shouldAddBottomSafeAreaPadding: true,
                                modalContainerStylePaddingBottom: 20,
                                safeAreaPaddingBottom: props.insets.bottom,
                            }),
                        ]}
                    >
                        <View style={[styles.componentHeightLarge, styles.mt6, styles.mb5]}>
                            <ExpensifyCashLogo
                                width={variables.componentSizeLarge}
                                height={variables.componentSizeLarge}
                            />
                        </View>
                        {props.shouldShowWelcomeText && (
                            <ExpensifyText style={[styles.mv5, styles.textLabel, styles.h3]}>
                                {props.welcomeText}
                            </ExpensifyText>
                        )}
                        {props.children}
                    </LoginKeyboardAvoidingView>
                </View>
                <View style={[styles.mb5, styles.alignSelfCenter, styles.ph5]}>
                    <TermsAndLicenses />
                </View>
            </ScrollView>
            <View style={[
                styles.flexGrow1,
                StyleUtils.getBackgroundColorStyle(backgroundStyle.backgroundColor),
                props.isMediumScreenWidth && styles.alignItemsCenter,
            ]}
            >
                <SVGImage
                    width="100%"
                    height="100%"
                    src={backgroundStyle.backgroundImageUri}
                />
            </View>
        </View>
    </View>
);

SignInPageLayoutWide.propTypes = propTypes;
SignInPageLayoutWide.displayName = 'SignInPageLayoutWide';

export default compose(
    withLocalize,
    withKeyboardState,
    withSafeAreaInsets,
)(SignInPageLayoutWide);

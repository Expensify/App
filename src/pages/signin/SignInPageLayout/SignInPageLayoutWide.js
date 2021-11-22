import React from 'react';
import {KeyboardAvoidingView, ScrollView, View} from 'react-native';
import PropTypes from 'prop-types';
import SVGImage from '../../../components/SVGImage';
import styles, {getBackgroundColorStyle, getLoginPagePromoStyle} from '../../../styles/styles';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import Text from '../../../components/Text';
import variables from '../../../styles/variables';
import TermsAndLicenses from '../TermsAndLicenses';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

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

const backgroundStyle = getLoginPagePromoStyle();

const SignInPageLayoutWide = props => (
    <View style={[styles.flex1, styles.signInPageInner]}>
        <View style={[styles.flex1, styles.flexRow, styles.flexGrow1]}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={styles.signInPageWideLeftContainer}
                contentContainerStyle={[styles.ph6, styles.flexColumn]}
            >
                <KeyboardAvoidingView
                    behavior="position"
                    style={[
                        styles.flex1,
                        styles.mt40Percentage,
                        styles.alignSelfCenter,
                        styles.w100,
                        styles.ph4,
                    ]}
                >
                    <View style={[styles.signInPageLogo, styles.mt6, styles.mb5]}>
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
                <View style={[styles.mv5, styles.ph4, styles.w100, styles.alignSelfCenter]}>
                    <TermsAndLicenses />
                </View>
            </ScrollView>
            <View style={[
                styles.flexGrow1,
                getBackgroundColorStyle(backgroundStyle.backgroundColor),
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

export default withLocalize(SignInPageLayoutWide);

import React from 'react';
import {KeyboardAvoidingView, ScrollView, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../../styles/styles';
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

const backgroundStyles = [styles.backgroundBlue, styles.backgroundGreen, styles.backgroundOrange, styles.backgroundPink];
const backgroundStyle = backgroundStyles[_.random(0, 3)];

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
                styles.flexRow,
                styles.background100,
                backgroundStyle,
                props.isMediumScreenWidth && styles.alignItemsCenter,
            ]}
            />
        </View>
    </View>
);

SignInPageLayoutWide.propTypes = propTypes;
SignInPageLayoutWide.displayName = 'SignInPageLayoutWide';

export default withLocalize(SignInPageLayoutWide);

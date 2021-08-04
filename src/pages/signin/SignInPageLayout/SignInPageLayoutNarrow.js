import React from 'react';
import {ScrollView, View, KeyboardAvoidingView} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import Text from '../../../components/Text';
import TermsAndLicenses from '../TermsAndLicenses';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    // welcomeText to show the header of the form.
    // Will change based on the form
    welcomeText: PropTypes.string.isRequired,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const SignInPageLayoutNarrow = props => (
    <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={[
            styles.flexGrow1,
            styles.mh5,
            styles.signInPageNarrowContentContainer,
            styles.alignSelfCenter,
        ]}
    >
        <KeyboardAvoidingView behavior="position">
            <View style={[styles.flexGrow1]}>
                <View
                    style={[
                        styles.signInPageInnerNative,
                        styles.flex1,
                        styles.dFlex,
                        styles.flexColumn,
                        props.windowHeight > props.windowWidth ? styles.mt40Percentage : null,
                    ]}
                >
                    <View style={[styles.signInPageLogoNative, styles.mb2]}>
                        <ExpensifyCashLogo
                            width={variables.componentSizeLarge}
                            height={variables.componentSizeLarge}
                        />
                    </View>
                    <Text style={[styles.mv5, styles.textLabel, styles.h3]}>
                        {props.welcomeText}
                    </Text>
                    {props.children}
                </View>
            </View>
        </KeyboardAvoidingView>
        <View style={[styles.mt3, styles.mb5, styles.alignSelfCenter]}>
            <TermsAndLicenses />
        </View>
    </ScrollView>
);

SignInPageLayoutNarrow.propTypes = propTypes;
SignInPageLayoutNarrow.displayName = 'SignInPageLayoutNarrow';

export default compose(
    withWindowDimensions,
    withLocalize,
)(SignInPageLayoutNarrow);

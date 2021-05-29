import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import TermsAndLicenses from '../TermsAndLicenses';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const propTypes = {
    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    ...withLocalizePropTypes,
};

const SignInPageLayoutNarrow = props => (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.flexGrow1, styles.p8]}>
        <View style={[styles.flexGrow1]}>
            <View
                style={[
                    styles.signInPageInnerNative,
                    styles.flex1,
                    styles.dFlex,
                    styles.flexColumn,
                    styles.mt30Percentage,
                ]}
            >
                <View style={[styles.signInPageLogoNative, styles.mb2]}>
                    <ExpensifyCashLogo
                        width={variables.componentSizeLarge}
                        height={variables.componentSizeLarge}
                    />
                </View>
                <Text style={[styles.mv5, styles.textLabel, styles.h3, styles.fontFamilyGTA]}>
                    {props.translate('welcomeText.phrase1')}
                </Text>
                {props.children}
            </View>
            <TermsAndLicenses />
        </View>
    </ScrollView>
);

SignInPageLayoutNarrow.propTypes = propTypes;
SignInPageLayoutNarrow.displayName = 'SignInPageLayoutNarrow';

export default withLocalize(SignInPageLayoutNarrow);

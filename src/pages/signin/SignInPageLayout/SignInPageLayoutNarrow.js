import React from 'react';
import {ScrollView, View, KeyboardAvoidingView} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import Text from '../../../components/Text';
import TermsAndLicenses from '../TermsAndLicenses';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {setBrowserAttributes} from '../../../libs/TextInputUtils';

const propTypes = {
    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    /** Welcome text to show in the header of the form, changes depending
     * on form type (set password, sign in, etc.) */
    welcomeText: PropTypes.string.isRequired,

    /** Whether to show welcome text on a particular page */
    shouldShowWelcomeText: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
};

class SignInPageLayoutNarrow extends React.Component {
    constructor(props) {
        super(props);
        this.form = null;
    }

    componentDidMount() {
        // These native props are needed for Password Managers like LastPass
        if (this.form) {
            setBrowserAttributes(this.form, 'method', 'post');
            setBrowserAttributes(this.form, 'action', '/');
        }
    }

    render() {
        return (
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={[
                    styles.flexGrow1,
                    styles.signInPageNarrowContentContainer,
                    styles.alignSelfCenter,
                ]}
                contentContainerStyle={styles.ph5}
            >
                <KeyboardAvoidingView behavior="position">
                    <View style={[styles.flexGrow1]}>
                        <View
                            style={[
                                styles.signInPageInnerNative,
                                styles.flex1,
                                styles.dFlex,
                                styles.flexColumn,
                                styles.mt40Percentage,
                            ]}
                            accessibilityRole="form"
                            accessibilityAutoComplete="on"
                            ref={el => this.form = el}
                        >
                            <View style={[styles.componentHeightLarge, styles.mb2]}>
                                <ExpensifyCashLogo
                                    width={variables.componentSizeLarge}
                                    height={variables.componentSizeLarge}
                                />
                            </View>
                            {this.props.shouldShowWelcomeText && (
                                <Text style={[styles.mv5, styles.textLabel, styles.h3]}>
                                    {this.props.welcomeText}
                                </Text>
                            )}
                            {this.props.children}
                        </View>
                    </View>
                </KeyboardAvoidingView>
                <View style={[styles.mt3, styles.mb5, styles.alignSelfCenter]}>
                    <TermsAndLicenses />
                </View>
            </ScrollView>
        );
    }
}

SignInPageLayoutNarrow.propTypes = propTypes;
SignInPageLayoutNarrow.displayName = 'SignInPageLayoutNarrow';

export default withLocalize(SignInPageLayoutNarrow);

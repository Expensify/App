import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import Text from '../../../components/Text';
import WelcomeScreenshot1 from '../../../../assets/images/freeplan_blue.svg';
import WelcomeScreenshot2 from '../../../../assets/images/freeplan_green.svg';
import WelcomeScreenshot3 from '../../../../assets/images/freeplan_orange.svg';
import WelcomeScreenshot4 from '../../../../assets/images/freeplan_pink.svg';
import variables from '../../../styles/variables';
import TermsAndLicenses from '../TermsAndLicenses';
import CONST from '../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import TextLink from '../../../components/TextLink';

const propTypes = {
    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    /** Welcome text to show in the header of the form, changes depending
     * on form type (set password, sign in, etc.) */
    welcomeText: PropTypes.string.isRequired,

    /* Flag to check medium screen with device */
    isMediumScreenWidth: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
};

const SignInPageLayoutWide = props => (
    <View style={[styles.flex1, styles.signInPageInner]}>
        <View style={[styles.flex1, styles.flexRow, styles.dFlex, styles.flexGrow1]}>
            <View style={[styles.signInPageWideLeftContainer, styles.dFlex, styles.flexColumn, styles.ph6]}>
                <View style={[
                    styles.flex1,
                    styles.dFlex,
                    styles.flexColumn,
                    styles.mt40Percentage,
                    styles.signInPageFormContainer,
                    styles.alignSelfCenter,
                ]}
                >
                    <View style={[styles.flex1]}>
                        <View style={[styles.signInPageLogo, styles.mt6, styles.mb5]}>
                            <ExpensifyCashLogo
                                width={variables.componentSizeLarge}
                                height={variables.componentSizeLarge}
                            />
                        </View>
                        <Text style={[styles.mv5, styles.textLabel, styles.h3]}>
                            {props.welcomeText}
                        </Text>
                        <View>
                            {props.children}
                        </View>
                    </View>
                    <View style={[styles.mv5]}>
                        <TermsAndLicenses />
                    </View>
                </View>
            </View>
            <View style={[
                styles.flexGrow1,
                styles.dFlex,
                styles.flexRow,
                styles.backgroundBlue,
                styles.justifyContentAround,
                styles.pb10Percentage,
                props.isMediumScreenWidth && styles.p10,
                props.isMediumScreenWidth && styles.alignItemsCenter,
            ]}
            >
                <View style={[styles.w100, styles.dFlex, styles.flexColumnReverse, styles.alignItemsCenter]}>
                    <WelcomeScreenshotBlue/>
                </View>
            </View>
        </View>
    </View>
);

SignInPageLayoutWide.propTypes = propTypes;
SignInPageLayoutWide.displayName = 'SignInPageLayoutWide';

export default withLocalize(SignInPageLayoutWide);

import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../../styles/styles';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import Text from '../../../components/Text';
import WelcomeScreenshotBlue from '../../../../assets/images/freeplan_blue.svg';
import WelcomeScreenshotGreen from '../../../../assets/images/freeplan_green.svg';
import WelcomeScreenshotOrange from '../../../../assets/images/freeplan_orange.svg';
import WelcomeScreenshotPink from '../../../../assets/images/freeplan_pink.svg';
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

    ...withLocalizePropTypes,
};

const SignInPageLayoutWide = (props) => {
    const screenShots = [WelcomeScreenshotBlue, WelcomeScreenshotGreen, WelcomeScreenshotOrange, WelcomeScreenshotPink];
    const backgroundStyles = [styles.backgroundBlue, styles.backgroundGreen, styles.backgroundOrange, styles.backgroundPink];
    const randomWelcome = _.random(0, 3);
    const WelcomeScreenshot = screenShots[randomWelcome];
    const backgroundStyle = backgroundStyles[randomWelcome];
    return (
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
                    backgroundStyle,
                    styles.justifyContentAround,
                    styles.pb10Percentage,
                    styles.alignItemsCenter,
                ]}
                >
                    <View style={[
                        !props.isMediumScreenWidth && styles.w100,
                        props.isMediumScreenWidth && styles.w75,
                        styles.dFlex,
                        styles.alignItemsCenter,
                    ]}
                    >
                        <WelcomeScreenshot />
                    </View>
                </View>
            </View>
        </View>
    );
};

SignInPageLayoutWide.propTypes = propTypes;
SignInPageLayoutWide.displayName = 'SignInPageLayoutWide';

export default withLocalize(SignInPageLayoutWide);

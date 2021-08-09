import React from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import Text from '../../../components/Text';
import welcomeScreenshot from '../../../../assets/images/welcome-screenshot.png';
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

    ...withLocalizePropTypes,
};

const SignInPageLayoutWide = props => (
    <View style={[styles.signInPageInner]}>
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
                styles.justifyContentAround,
                styles.backgroundBlue,
                styles.pb10Percentage,
                styles.p20,
            ]}
            >
                <View style={[styles.dFlex, styles.flexColumnReverse, styles.alignItemsCenter, styles.w50]}>
                    <View style={[styles.signInPageWideHeroContent, styles.m4]}>
                        <Text style={[styles.signInPageHeroHeading]}>{props.translate('signInPage.heroHeading')}</Text>
                        <Text style={[styles.signInPageHeroDescription, styles.mt5]}>
                            {props.translate('signInPage.heroDescription.phrase1')}
                            {'\n\n'}
                            {props.translate('signInPage.heroDescription.phrase2')}
                            {' '}
                            <TextLink href={CONST.GITHUB_URL}>
                                <Text style={[styles.textUnderline, styles.textWhite]}>
                                    {props.translate('signInPage.heroDescription.phrase3')}
                                </Text>
                            </TextLink>
                            {'. '}
                            {props.translate('signInPage.heroDescription.phrase4')}
                            {' '}
                            <TextLink href={CONST.UPWORK_URL}>
                                <Text style={[styles.textUnderline, styles.textWhite]}>
                                    {props.translate('signInPage.heroDescription.phrase5')}
                                </Text>
                            </TextLink>

                            .
                        </Text>
                    </View>
                </View>
                <View style={[styles.w50, styles.dFlex, styles.flexColumnReverse, styles.alignItemsCenter]}>
                    <Image
                        resizeMode="contain"
                        style={[styles.signInWelcomeScreenshotWide]}
                        source={welcomeScreenshot}
                    />
                </View>
            </View>
        </View>
    </View>
);

SignInPageLayoutWide.propTypes = propTypes;
SignInPageLayoutWide.displayName = 'SignInPageLayoutWide';

export default withLocalize(SignInPageLayoutWide);

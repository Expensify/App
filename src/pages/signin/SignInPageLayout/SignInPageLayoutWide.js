import React from 'react';
import {Image, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import welcomeScreenshot from '../../../../assets/images/welcome-screenshot.png';
import variables from '../../../styles/variables';
import TermsAndLicenses from '../TermsAndLicenses';
import openURLInNewTab from '../../../libs/openURLInNewTab';
import CONST from '../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const propTypes = {
    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    ...withLocalizePropTypes,
};

const SignInPageLayoutWide = props => (
    <View style={[styles.signInPageInner]}>
        <View style={[styles.flex1, styles.flexRow, styles.dFlex, styles.flexGrow1]}>
            <View style={[styles.signInPageWideLeftContainer, styles.dFlex, styles.flexColumn, styles.ph6]}>
                <View style={[styles.flex1, styles.dFlex, styles.flexColumn, styles.mt40Percentage]}>
                    <View style={[styles.signInPageLogo, styles.mt6, styles.mb5]}>
                        <ExpensifyCashLogo width={variables.componentSizeLarge} height={variables.componentSizeLarge} />
                    </View>
                    <Text style={[styles.mv5, styles.textLabel, styles.h3, styles.fontFamilyGTA]}>
                        {props.translate('welcomeText.phrase1')}
                    </Text>
                    <View style={[styles.signInPageFormContainer]}>
                        {props.children}
                    </View>
                </View>
                <View style={[styles.mv5]}>
                    <TermsAndLicenses />
                </View>
            </View>
            <View style={[
                styles.flexGrow1,
                styles.dFlex,
                styles.flexRow,
                styles.justifyContentAround,
                styles.backgroundBlue,
                styles.pb10Percentage,
            ]}
            >
                <View style={[styles.dFlex, styles.flexColumnReverse, styles.alignItemsCenter, styles.w50]}>
                    <View style={[styles.signInPageWideHeroContent, styles.m4]}>
                        <Text style={[styles.signInPageHeroHeading]}>{props.translate('signInPage.heroHeading')}</Text>
                        <Text style={[styles.signInPageHeroDescription, styles.mt5]}>
                            {props.translate('signInPage.heroDescription.phase1')}
                            {'\n\n'}
                            {props.translate('signInPage.heroDescription.phase2')}
                            {' '}
                            <Text style={[styles.textUnderline]} onPress={() => openURLInNewTab(CONST.GITHUB_URL)}>
                                {props.translate('signInPage.heroDescription.phase3')}
                            </Text>
                            {'. '}
                            {props.translate('signInPage.heroDescription.phase4')}
                            {' '}
                            <Text style={[styles.textUnderline]} onPress={() => openURLInNewTab(CONST.UPWORK_URL)}>
                                {props.translate('signInPage.heroDescription.phase5')}
                            </Text>
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

import React from 'react';
import {
    Image, Text, View,
} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import welcomeScreenshot from '../../../../assets/images/welcome-screenshot-wide.png';
import variables from '../../../styles/variables';
import TermsAndLicenses from '../TermsAndLicenses';
import WelcomeText from '../../../components/WelcomeText';
import openURLInNewTab from '../../../libs/openURLInNewTab';
import CONST from '../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const propTypes = {
    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    /** Whether we should show the welcome text (the welcome screenshot always displays on wide views) */
    shouldShowWelcomeText: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldShowWelcomeText: true,
};

const SignInPageLayoutWide = props => (
    <View style={[styles.signInPageInner]}>
        <View style={[styles.flex1, styles.flexRow]}>
            <View style={[styles.flex1, styles.w50, styles.alignItemsCenter]}>
                <View>
                    <Image
                        resizeMode="contain"
                        style={[styles.signinWelcomeScreenshotWide]}
                        source={welcomeScreenshot}
                    />
                </View>
            </View>
            <View style={[styles.flex1, styles.w50]}>
                <View style={[styles.signInPageLogo, styles.mt6, styles.mb5]}>
                    <ExpensifyCashLogo width={variables.componentSizeLarge} height={variables.componentSizeLarge} />
                </View>

                <View style={[styles.mb5]}>
                    <Text style={[styles.h1]}>
                        {props.translate('signInPage.expensifyDotCash')}
                    </Text>
                </View>
                <View style={[styles.signInPageFormContainer]}>
                    {props.children}
                </View>
                {props.shouldShowWelcomeText
                    && (
                    <View style={[styles.mt6, styles.mb6]}>
                        <WelcomeText textSize="large" />
                    </View>
                    )}
                <View>
                    <Text style={[styles.textLabel]}>
                        {`${props.translate('signInPage.expensifyIsOpenSource')}. ${
                            props.translate('common.view')}`}
                        {' '}
                        <Text
                            style={[styles.link]}
                            onPress={() => openURLInNewTab(CONST.GITHUB_URL)}
                        >
                            {props.translate('signInPage.theCode')}
                        </Text>
                        {`. ${props.translate('common.view')}`}
                        {' '}
                        <Text
                            style={[styles.link]}
                            onPress={() => openURLInNewTab(CONST.UPWORK_URL)}
                        >
                            {props.translate('signInPage.openJobs')}
                        </Text>
                        .
                    </Text>
                </View>
                <TermsAndLicenses />
            </View>
        </View>
    </View>
);

SignInPageLayoutWide.propTypes = propTypes;
SignInPageLayoutWide.defaultProps = defaultProps;
SignInPageLayoutWide.displayName = 'SignInPageLayoutWide';


export default withLocalize(SignInPageLayoutWide);

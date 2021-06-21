import React from 'react';
import {
    Image,
    ScrollView, Text, View,
} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import welcomeScreenshot from '../../../../assets/images/welcome-screenshot.png';
import TermsAndLicenses from '../TermsAndLicenses';
import WelcomeText from '../../../components/WelcomeText';
import TextLink from '../../../components/TextLink';
import CONST from '../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const propTypes = {

    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    /** Whether we should show the welcome elements */
    shouldShowWelcomeText: PropTypes.bool,
    shouldShowWelcomeScreenshot: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldShowWelcomeText: true,
    shouldShowWelcomeScreenshot: true,
};

const SignInPageLayoutNarrow = props => (
    <ScrollView keyboardShouldPersistTaps="handled">
        <View>
            <View style={[styles.signInPageInnerNative]}>
                <View style={[styles.signInPageLogoNative]}>
                    <ExpensifyCashLogo width={variables.componentSizeLarge} height={variables.componentSizeLarge} />
                </View>

                <View style={[styles.mb6, styles.alignItemsCenter]}>
                    <Text style={[styles.h1]}>
                        {props.translate('signInPage.expensifyDotCash')}
                    </Text>
                </View>

                <View style={[styles.signInPageFormContainer]}>
                    {props.children}

                    {props.shouldShowWelcomeScreenshot
                        && (
                        <View style={[styles.mt5, styles.mb5]}>
                            <Image
                                resizeMode="contain"
                                style={[styles.signinWelcomeScreenshot]}
                                source={welcomeScreenshot}
                            />
                        </View>
                        )}

                    {props.shouldShowWelcomeText && <WelcomeText />}
                    <View style={[styles.flexRow, styles.flexWrap, styles.mt6]}>
                        <Text style={[styles.textLabel]}>
                            {`${props.translate('signInPage.expensifyIsOpenSource')}. ${
                                props.translate('common.view')}`}
                            {' '}
                        </Text>
                        <TextLink style={[styles.textLabel]} href={CONST.GITHUB_URL}>
                            {props.translate('signInPage.theCode')}
                        </TextLink>
                        <Text style={[styles.textLabel]}>
                            .
                        </Text>
                        <Text style={[styles.textLabel]}>
                            {`${props.translate('common.view')}`}
                            {' '}
                        </Text>
                        <TextLink style={[styles.textLabel]} href={CONST.UPWORK_URL}>
                            {props.translate('signInPage.openJobs')}
                        </TextLink>
                        <Text style={[styles.textLabel]}>
                            .
                        </Text>
                    </View>
                </View>
                <TermsAndLicenses />
            </View>
        </View>
    </ScrollView>
);

SignInPageLayoutNarrow.propTypes = propTypes;
SignInPageLayoutNarrow.defaultProps = defaultProps;
SignInPageLayoutNarrow.displayName = 'SignInPageLayoutNarrow';


export default withLocalize(SignInPageLayoutNarrow);

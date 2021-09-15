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
import {setNativePropsWeb} from '../../../libs/TextInputUtils';

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

class SignInPageLayoutWide extends React.Component {
    constructor(props) {
        super(props);
        this.form = null;
    }

    componentDidMount() {
        // These native props are needed for Password Managers like LastPass
        if (this.form) {
            setNativePropsWeb(this.form, 'method', 'post');
            setNativePropsWeb(this.form, 'action', '/');
        }
    }

    render() {
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
                                    {this.props.welcomeText}
                                </Text>
                                <View
                                    accessibilityRole="form"
                                    accessibilityAutoComplete="on"
                                    ref={el => this.form = el}
                                >
                                    {this.props.children}
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
                        !this.props.isMediumScreenWidth && styles.p20,
                        this.props.isMediumScreenWidth && styles.p10,
                        this.props.isMediumScreenWidth && styles.alignItemsCenter,
                    ]}
                    >
                        <View style={[styles.dFlex, styles.flexColumnReverse, styles.alignItemsCenter, styles.w50]}>
                            <View style={[styles.signInPageWideHeroContent, styles.m4]}>
                                <Text style={[styles.signInPageHeroHeading]}>{this.props.translate('signInPage.heroHeading')}</Text>
                                <Text style={[styles.signInPageHeroDescription, styles.mt5]}>
                                    {this.props.translate('signInPage.heroDescription.phrase1')}
                                    {'\n\n'}
                                    {this.props.translate('signInPage.heroDescription.phrase2')}
                                    {' '}
                                    <TextLink href={CONST.GITHUB_URL}>
                                        <Text style={[styles.textUnderline, styles.textWhite]}>
                                            {this.props.translate('signInPage.heroDescription.phrase3')}
                                        </Text>
                                    </TextLink>
                                    {'. '}
                                    {this.props.translate('signInPage.heroDescription.phrase4')}
                                    {' '}
                                    <TextLink href={CONST.UPWORK_URL}>
                                        <Text style={[styles.textUnderline, styles.textWhite]}>
                                            {this.props.translate('signInPage.heroDescription.phrase5')}
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
    }
}

SignInPageLayoutWide.propTypes = propTypes;
SignInPageLayoutWide.displayName = 'SignInPageLayoutWide';

export default withLocalize(SignInPageLayoutWide);

import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import SVGImage from '../../../components/SVGImage';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import ExpensifyCashLogo from '../../../components/ExpensifyCashLogo';
import Text from '../../../components/Text';
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

    /** Whether to show welcome text on a particular page */
    shouldShowWelcomeText: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
};

const backgroundStyle = StyleUtils.getLoginPagePromoStyle();

const SignInPageLayoutWide = props => (
    <View style={[styles.flex1, styles.signInPageInner]}>
        <View style={[styles.flex1, styles.flexRow, styles.flexGrow1]}>
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
                        {props.shouldShowWelcomeText && (
                            <Text style={[styles.mv5, styles.textLabel, styles.h3]}>
                                {props.welcomeText}
                            </Text>
                        )}
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
                StyleUtils.getBackgroundColorStyle(backgroundStyle.backgroundColor),
                props.isMediumScreenWidth && styles.alignItemsCenter,
            ]}
            >
                <SVGImage
                    width="100%"
                    height="100%"
                    src={backgroundStyle.backgroundImageUri}
                />
            </View>
        </View>
    </View>
);

SignInPageLayoutWide.propTypes = propTypes;
SignInPageLayoutWide.displayName = 'SignInPageLayoutWide';

export default withLocalize(SignInPageLayoutWide);

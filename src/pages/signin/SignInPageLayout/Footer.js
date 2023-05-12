import PropTypes from 'prop-types';
import {View} from 'react-native';
import React from 'react';
import _ from 'underscore';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import themeColors from '../../../styles/themes/default';
import variables from '../../../styles/variables';
import * as Expensicons from '../../../components/Icon/Expensicons';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import compose from '../../../libs/compose';
import Licenses from '../Licenses';
import Socials from '../Socials';
import Hoverable from '../../../components/Hoverable';
import CONST from '../../../CONST';
import Navigation, {navigationRef} from '../../../libs/Navigation/Navigation';
import * as Session from '../../../libs/actions/Session';
import SignInGradient from '../../../../assets/images/home-fade-gradient--mobile.svg';
import screens from '../../../SCREENS';

const propTypes = {
    scrollViewRef: PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        current: PropTypes.any,
    }),
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    scrollViewRef: undefined,
};

const navigateHome = (scrollViewRef) => {
    const currentRoute = navigationRef.current.getCurrentRoute();
    if (currentRoute.name === screens.HOME && scrollViewRef && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
            y: 0,
            animated: true,
        });
    } else {
        Navigation.navigate();
    }

    // We need to clear sign in data in case the user is already in the ValidateCodeForm or PasswordForm pages
    Session.clearSignInData();
};

const columns = [
    {
        translationPath: 'footer.features',
        rows: [
            {
                link: CONST.FOOTER.EXPENSE_MANAGEMENT_URL,
                translationPath: 'footer.expenseManagement',
            },
            {
                link: CONST.FOOTER.SPEND_MANAGEMENT_URL,
                translationPath: 'footer.spendManagement',
            },
            {
                link: CONST.FOOTER.EXPENSE_REPORTS_URL,
                translationPath: 'footer.expenseReports',
            },
            {
                link: CONST.FOOTER.COMPANY_CARD_URL,
                translationPath: 'footer.companyCreditCard',
            },
            {
                link: CONST.FOOTER.RECIEPT_SCANNING_URL,
                translationPath: 'footer.receiptScanningApp',
            },
            {
                link: CONST.FOOTER.BILL_PAY_URL,
                translationPath: 'footer.billPay',
            },
            {
                link: CONST.FOOTER.INVOICES_URL,
                translationPath: 'footer.invoicing',
            },
            {
                link: CONST.FOOTER.CPA_CARD_URL,
                translationPath: 'footer.CPACard',
            },
            {
                link: CONST.FOOTER.PAYROLL_URL,
                translationPath: 'footer.payroll',
            },
            {
                link: CONST.FOOTER.TRAVEL_URL,
                translationPath: 'footer.travel',
            },
        ],
    },
    {
        translationPath: 'footer.resources',
        rows: [
            {
                link: CONST.FOOTER.EXPENSIFY_APPROVED_URL,
                translationPath: 'footer.expensifyApproved',
            },
            {
                link: CONST.FOOTER.PRESS_KIT_URL,
                translationPath: 'footer.pressKit',
            },
            {
                link: CONST.FOOTER.SUPPORT_URL,
                translationPath: 'footer.support',
            },
            {
                link: CONST.NEWHELP_URL,
                translationPath: 'footer.expensifyHelp',
            },
            {
                link: CONST.FOOTER.COMMUNITY_URL,
                translationPath: 'footer.community',
            },
            {
                link: CONST.FOOTER.PRIVACY_URL,
                translationPath: 'footer.privacy',
            },
        ],
    },
    {
        translationPath: 'footer.learnMore',
        rows: [
            {
                link: CONST.FOOTER.ABOUT_URL,
                translationPath: 'footer.aboutExpensify',
            },
            {
                link: CONST.FOOTER.BLOG_URL,
                translationPath: 'footer.blog',
            },
            {
                link: CONST.FOOTER.JOBS_URL,
                translationPath: 'footer.jobs',
            },
            {
                link: CONST.FOOTER.ORG_URL,
                translationPath: 'footer.expensifyOrg',
            },
            {
                link: CONST.FOOTER.INVESTOR_RELATIONS_URL,
                translationPath: 'footer.investorRelations',
            },
        ],
    },
    {
        translationPath: 'footer.getStarted',
        rows: [
            {
                onPress: navigateHome,
                translationPath: 'footer.createAccount',
            },
            {
                onPress: navigateHome,
                translationPath: 'footer.logIn',
            },
        ],
    },
];

const Footer = (props) => {
    const isVertical = props.isSmallScreenWidth;
    const imageDirection = isVertical ? styles.flexRow : styles.flexColumn;
    const imageStyle = isVertical ? styles.pr0 : styles.alignSelfCenter;
    const columnDirection = isVertical ? styles.flexColumn : styles.flexRow;
    const pageFooterWrapper = [styles.footerWrapper, imageDirection, imageStyle, isVertical ? styles.pl10 : {}];
    const footerColumns = [styles.footerColumnsContainer, columnDirection];
    const footerColumn = isVertical ? [styles.p4] : [styles.p4, props.isMediumScreenWidth ? styles.w50 : styles.w25];

    return (
        <View style={[styles.flex1]}>
            <View style={[props.isSmallScreenWidth ? StyleUtils.getBackgroundColorStyle(themeColors.signInPage) : {}]}>
                {props.isSmallScreenWidth ? (
                    <View style={[styles.signInPageGradientMobile]}>
                        <SignInGradient height="100%" />
                    </View>
                ) : null}
                <View style={pageFooterWrapper}>
                    <View style={footerColumns}>
                        {_.map(columns, (column, i) => (
                            <View
                                key={column.translationPath}
                                style={footerColumn}
                            >
                                <Text style={[styles.textHeadline, styles.footerTitle]}>{props.translate(column.translationPath)}</Text>
                                <View style={[styles.footerRow]}>
                                    {_.map(column.rows, (row) => (
                                        <Hoverable key={row.translationPath}>
                                            {(hovered) => (
                                                <TextLink
                                                    style={[styles.footerRow, hovered ? styles.textBlue : {}]}
                                                    href={row.link}
                                                    onPress={row.onPress ? () => row.onPress(props.scrollViewRef) : undefined}
                                                >
                                                    {props.translate(row.translationPath)}
                                                </TextLink>
                                            )}
                                        </Hoverable>
                                    ))}
                                    {i === 2 && (
                                        <View style={styles.mt5}>
                                            <Socials />
                                        </View>
                                    )}
                                    {i === 3 && (
                                        <View style={styles.mv4}>
                                            <Licenses />
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                    <View style={[!isVertical && styles.footerBottomLogo]}>
                        {!isVertical ? (
                            <Expensicons.ExpensifyFooterLogo />
                        ) : (
                            <Expensicons.ExpensifyFooterLogoVertical
                                height={variables.verticalLogoHeight}
                                width={variables.verticalLogoWidth}
                            />
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

Footer.propTypes = propTypes;
Footer.displayName = 'Footer';
Footer.defaultProps = defaultProps;

export default compose(withLocalize, withWindowDimensions)(Footer);

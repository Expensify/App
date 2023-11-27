import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import SignInGradient from '@assets/images/home-fade-gradient--mobile.svg';
import Hoverable from '@components/Hoverable';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import Licenses from '@pages/signin/Licenses';
import Socials from '@pages/signin/Socials';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';

const propTypes = {
    ...withLocalizePropTypes,
    scrollPageToTop: PropTypes.func.isRequired,
    shouldShowSmallScreen: PropTypes.bool,
};

const defaultProps = {
    shouldShowSmallScreen: false,
};

const navigateHome = (scrollPageToTop) => {
    scrollPageToTop();

    // We need to clear sign in data in case the user is already in the ValidateCodeForm or PasswordForm pages
    Session.clearSignInData();
};

const columns = ({scrollPageToTop}) => [
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
                onPress: () => navigateHome(scrollPageToTop),
                translationPath: 'footer.createAccount',
            },
            {
                onPress: () => navigateHome(scrollPageToTop),
                translationPath: 'footer.logIn',
            },
        ],
    },
];

function Footer(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const isVertical = props.shouldShowSmallScreen;
    const imageDirection = isVertical ? styles.flexRow : styles.flexColumn;
    const imageStyle = isVertical ? styles.pr0 : styles.alignSelfCenter;
    const columnDirection = isVertical ? styles.flexColumn : styles.flexRow;
    const pageFooterWrapper = [styles.footerWrapper, imageDirection, imageStyle, isVertical ? styles.pl10 : {}];
    const footerColumns = [styles.footerColumnsContainer, columnDirection];
    const footerColumn = isVertical ? [styles.p4] : [styles.p4, props.isMediumScreenWidth ? styles.w50 : styles.w25];
    const footerWrapper = isVertical ? [StyleUtils.getBackgroundColorStyle(theme.signInPage), styles.overflowHidden] : [];

    return (
        <View style={[styles.flex1]}>
            <View style={footerWrapper}>
                {isVertical ? (
                    <View style={[styles.signInPageGradientMobile]}>
                        <SignInGradient height="100%" />
                    </View>
                ) : null}
                <View style={pageFooterWrapper}>
                    <View style={footerColumns}>
                        {_.map(columns({scrollPageToTop: props.scrollPageToTop}), (column, i) => (
                            <View
                                key={column.translationPath}
                                style={footerColumn}
                            >
                                <Text style={[styles.textHeadline, styles.footerTitle]}>{props.translate(column.translationPath)}</Text>
                                <View style={[styles.footerRow]}>
                                    {_.map(column.rows, (row) => (
                                        <Hoverable key={row.translationPath}>
                                            {(hovered) => (
                                                <View>
                                                    <TextLink
                                                        style={[styles.footerRow, hovered ? styles.textBlue : {}]}
                                                        href={row.link}
                                                        onPress={row.onPress}
                                                    >
                                                        {props.translate(row.translationPath)}
                                                    </TextLink>
                                                </View>
                                            )}
                                        </Hoverable>
                                    ))}
                                    {i === 2 && (
                                        <View style={styles.mt4}>
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
}

Footer.propTypes = propTypes;
Footer.displayName = 'Footer';
Footer.defaultProps = defaultProps;

export default withLocalize(Footer);

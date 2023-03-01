import {View} from 'react-native';
import React from 'react';
import _ from 'underscore';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
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

const propTypes = {
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
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
                link: CONST.NEW_EXPENSIFY_URL,
                translationPath: 'footer.createAccount',
            },
            {
                link: CONST.NEW_EXPENSIFY_URL,
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
    const pageFooterWrapper = [styles.footerWrapper, imageDirection, imageStyle];
    const footerColumns = [styles.footerColumnsContainer, columnDirection];
    const footerColumn = isVertical ? [styles.p4] : [styles.p4, props.isMediumScreenWidth ? styles.w50 : styles.w25];

    return (
        <View style={[styles.flex1]}>
            <View style={styles.footer}>
                <View style={pageFooterWrapper}>
                    <View style={footerColumns}>
                        {_.map(columns, (column, i) => (
                            <View
                                key={column.translationPath}
                                style={footerColumn}
                            >
                                <Text style={[styles.textHeadline, styles.footerTitle]}>
                                    {props.translate(column.translationPath)}
                                </Text>
                                <View style={[styles.footerRow]}>
                                    {_.map(column.rows, row => (
                                        <Hoverable
                                            key={row.translationPath}
                                        >
                                            {hovered => (
                                                <TextLink
                                                    style={[styles.footerRow, hovered ? styles.textBlue : {}]}
                                                    href={row.link}
                                                >
                                                    {props.translate(row.translationPath)}
                                                </TextLink>
                                            )}
                                        </Hoverable>
                                    ))}
                                    {(i === 2) && (
                                        <View style={styles.mt5}>
                                            <Socials />
                                        </View>
                                    )}
                                    {(i === 3) && (
                                        <View style={styles.mv4}>
                                            <Licenses />
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                    <View style={[!isVertical && styles.footerBottomLogo]}>
                        {!isVertical
                            ? (
                                <Expensicons.ExpensifyFooterLogo />
                            ) : (
                                <Expensicons.ExpensifyFooterLogoVertical height={variables.verticalLogoHeight} width={variables.verticalLogoWidth} />
                            )}
                    </View>
                </View>
            </View>
        </View>
    );
};

Footer.propTypes = propTypes;
Footer.displayName = 'Footer';

export default compose(
    withLocalize,
    withWindowDimensions,
)(Footer);

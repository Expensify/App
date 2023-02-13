/* eslint-disable no-unused-vars */
import {View} from 'react-native';
import React from 'react';
import _ from 'underscore';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import * as Expensicons from '../../../components/Icon/Expensicons';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import compose from '../../../libs/compose';
import TermsAndLicenses from '../TermsAndLicenses';
import Socials from '../Socials';
import Hoverable from '../../../components/Hoverable';

const propTypes = {
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const columns = [
    {
        translationPath: 'footer.features',
        rows: [
            {
                link: 'https://use.expensify.com/expense-management',
                translationPath: 'footer.expenseManagement',
            },
            {
                link: 'https://use.expensify.com/spend-management',
                translationPath: 'footer.spendManagement',
            },
            {
                link: 'https://use.expensify.com/expense-reports',
                translationPath: 'footer.expenseReports',
            },
            {
                link: 'https://use.expensify.com/company-credit-card',
                translationPath: 'footer.companyCreditCard',
            },
            {
                link: 'https://use.expensify.com/receipt-scanning-app',
                translationPath: 'footer.receiptScanningApp',
            },
            {
                link: 'https://use.expensify.com/bills',
                translationPath: 'footer.billPay',
            },
            {
                link: 'https://use.expensify.com/invoices',
                translationPath: 'footer.invoicing',
            },
            {
                link: 'https://use.expensify.com/cpa-card',
                translationPath: 'footer.CPACard',
            },
            {
                link: 'https://use.expensify.com/payroll',
                translationPath: 'footer.payroll',
            },
            {
                link: 'https://use.expensify.com/travel',
                translationPath: 'footer.travel',
            },
        ],
    },
    {
        translationPath: 'footer.resources',
        rows: [
            {
                link: 'https://use.expensify.com/accountants',
                translationPath: 'footer.expensifyApproved',
            },
            {
                link: 'https://we.are.expensify.com/press-kit',
                translationPath: 'footer.pressKit',
            },
            {
                link: 'https://use.expensify.com/support',
                translationPath: 'footer.support',
            },
            {
                link: 'https://help.expensify.com/',
                translationPath: 'footer.expensifyHelp',
            },
            {
                link: 'https://community.expensify.com/',
                translationPath: 'footer.community',
            },
            {
                link: 'https://use.expensify.com/privacy',
                translationPath: 'footer.privacy',
            },
        ],
    },
    {
        translationPath: 'footer.learnMore',
        rows: [
            {
                link: 'https://we.are.expensify.com/',
                translationPath: 'footer.aboutExpensify',
            },
            {
                link: 'https://blog.expensify.com/',
                translationPath: 'footer.blog',
            },
            {
                link: 'https://we.are.expensify.com/apply',
                translationPath: 'footer.jobs',
            },
            {
                link: 'https://www.expensify.org/',
                translationPath: 'footer.expensifyOrg',
            },
            {
                link: 'https://ir.expensify.com/',
                translationPath: 'footer.investorRelations',
            },
        ],
    },
    {
        translationPath: 'footer.getStarted',
        rows: [
            {
                link: 'https://www.new.expensify.com/',
                translationPath: 'footer.createAccount',
            },
            {
                link: 'https://www.new.expensify.com/',
                translationPath: 'footer.logIn',
            },
        ],
    },
];

const Footer = (props) => {
    const imageDirection = props.isSmallScreenWidth ? styles.flexRow : styles.flexColumn;
    const columnDirection = props.isSmallScreenWidth ? styles.flexColumn : styles.flexRow;

    const pageFooter = [styles.flex1, styles.flexGrow1];
    const pageFooterWrapper = [styles.footerWrapper, imageDirection];
    let footerColumns = [styles.footerColumnsContainer, columnDirection];
    let footerColumn = [styles.footerColumn];

    if (!props.isSmallScreenWidth) {
        footerColumn = [...footerColumn, styles.p4, styles.flex1];
        footerColumns = [...footerColumns, styles.footerLargeScreenAlign];
    }

    return (
        <View style={pageFooter}>
            <View style={pageFooterWrapper}>
                <View style={footerColumns}>
                    { /** Columns * */ }
                    {_.map(columns, (column, i) => (
                        <View
                            key={column.translationPath + i}
                            style={footerColumn}
                        >
                            <Text style={[styles.textHeadline, styles.footerTitle]}>
                                {props.translate(column.translationPath)}
                            </Text>
                            <View style={[styles.footerRow]}>
                                { /** Rows * */ }
                                {_.map(column.rows, (row, j) => (
                                    <Hoverable
                                        key={row.translationPath + j}
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
                                    <View style={styles.footerTermsContainer}>
                                        <TermsAndLicenses />
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
                { /** Expensify Wordmark * */ }
                <View style={[!props.isSmallScreenWidth && styles.footerLargeScreenAlign]}>
                    {!props.isSmallScreenWidth ? (
                        <Expensicons.ExpensifyFooterLogo />
                    )
                        : (
                            <Expensicons.ExpensifyFooterLogoVertical height={634} width={111} />
                        )}
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

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
                link: 'https://www.expensify.com/',
                translationPath: 'footer.createAaccount',
            },
            {
                link: 'https://www.expensify.com/',
                translationPath: 'footer.logIn',
            },
        ],
    },
];

const Footer = props => (
    <View style={[props.isSmallScreenWidth ? [styles.footerContainer, styles.flexRow] : [styles.footerContainer, styles.flexColumn]]}>
        <View style={[styles.flex1, styles.footerColumns, props.isSmallScreenWidth ? styles.flexColumn : styles.flexRow]}>
            { /** Columns * */ }
            {_.map(columns, (column, i) => (
                <View key={column.translationPath + i} style={[styles.footerColumn, {marginRight: 20}]}>
                    <Text style={[styles.textHeadline, {color: 'green'}, styles.footerTitle]}>
                        {props.translate(column.translationPath)}
                        {i}
                    </Text>
                    <View style={[styles.footerRow]}>
                        { /** Rows * */ }
                        {_.map(column.rows, (row, j) => (
                            <TextLink
                                style={[styles.footerRow]}
                                href={row.link}
                                key={row.translationPath + j}
                            >
                                {props.translate(row.translationPath)}
                            </TextLink>
                        ))}
                    </View>
                </View>
            ))}
        </View>
        { /** Expensify Wordmark * */ }
        <View style={props.isSmallScreenWidth ? [] : []}>
            {!props.isSmallScreenWidth ? (
                <Expensicons.ExpensifyFooterLogo height={100} width={500} />
            )
                : (
                    <Expensicons.ExpensifyFooterLogoVertical height={500} width={100} />
                )}
            {/* <Icon
                width={props.isSmallScreenWidth ? 100 : 500}
                height={props.isSmallScreenWidth ? 500 : 100}
                src={props.isSmallScreenWidth ? Expensicons.ExpensifyFooterLogoVertical : Expensicons.ExpensifyFooterLogo}
            /> */}
        </View>
    </View>
);

Footer.propTypes = propTypes;
Footer.displayName = 'Footer';

export default compose(
    withLocalize,
    withWindowDimensions,
)(Footer);

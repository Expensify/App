import SignInGradient from '@assets/images/home-fade-gradient--mobile.svg';

import Hoverable from '@components/Hoverable';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Licenses from '@pages/signin/Licenses';
import Socials from '@pages/signin/Socials';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {FooterColumnRow, SignInPageLayoutProps} from './types';

import FooterRow from './FooterRow';

type FooterProps = Pick<SignInPageLayoutProps, 'navigateFocus'>;

type FooterColumnData = {
    translationPath: TranslationPaths;
    rows: FooterColumnRow[];
};

const columns = ({navigateFocus = () => {}}: Pick<FooterProps, 'navigateFocus'>): FooterColumnData[] => [
    {
        translationPath: 'footer.features',
        rows: [
            {
                href: CONST.FOOTER.EXPENSE_MANAGEMENT_URL,
                translationPath: 'footer.expenseManagement',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.EXPENSE_MANAGEMENT,
            },
            {
                href: CONST.FOOTER.SPEND_MANAGEMENT_URL,
                translationPath: 'footer.spendManagement',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.SPEND_MANAGEMENT,
            },
            {
                href: CONST.FOOTER.EXPENSE_REPORTS_URL,
                translationPath: 'footer.expenseReports',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.EXPENSE_REPORTS,
            },
            {
                href: CONST.FOOTER.COMPANY_CARD_URL,
                translationPath: 'footer.companyCreditCard',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.COMPANY_CREDIT_CARD,
            },
            {
                href: CONST.FOOTER.RECEIPT_SCANNING_URL,
                translationPath: 'footer.receiptScanningApp',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.RECEIPT_SCANNING_APP,
            },
            {
                href: CONST.FOOTER.BILL_PAY_URL,
                translationPath: 'footer.billPay',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.BILL_PAY,
            },
            {
                href: CONST.FOOTER.INVOICES_URL,
                translationPath: 'footer.invoicing',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.INVOICING,
            },
            {
                href: CONST.FOOTER.PAYROLL_URL,
                translationPath: 'footer.payroll',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.PAYROLL,
            },
            {
                href: CONST.FOOTER.TRAVEL_URL,
                translationPath: 'footer.travel',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.TRAVEL,
            },
        ],
    },
    {
        translationPath: 'footer.resources',
        rows: [
            {
                href: CONST.FOOTER.EXPENSIFY_APPROVED_URL,
                translationPath: 'footer.expensifyApproved',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.EXPENSIFY_APPROVED,
            },
            {
                href: CONST.FOOTER.PRESS_KIT_URL,
                translationPath: 'footer.pressKit',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.PRESS_KIT,
            },
            {
                href: CONST.FOOTER.SUPPORT_URL,
                translationPath: 'footer.support',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.SUPPORT,
            },
            {
                href: CONST.NEWHELP_URL,
                translationPath: 'footer.expensifyHelp',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.EXPENSIFY_HELP,
            },
            {
                href: CONST.FOOTER.TERMS_URL,
                translationPath: 'footer.terms',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.TERMS,
            },
            {
                href: CONST.FOOTER.PRIVACY_URL,
                translationPath: 'footer.privacy',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.PRIVACY,
            },
        ],
    },
    {
        translationPath: 'footer.learnMore',
        rows: [
            {
                href: CONST.FOOTER.ABOUT_URL,
                translationPath: 'footer.aboutExpensify',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.ABOUT_EXPENSIFY,
            },
            {
                href: CONST.FOOTER.BLOG_URL,
                translationPath: 'footer.blog',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.BLOG,
            },
            {
                href: CONST.FOOTER.JOBS_URL,
                translationPath: 'footer.jobs',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.JOBS,
            },
            {
                href: CONST.FOOTER.ORG_URL,
                translationPath: 'footer.expensifyOrg',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.EXPENSIFY_ORG,
            },
            {
                href: CONST.FOOTER.INVESTOR_RELATIONS_URL,
                translationPath: 'footer.investorRelations',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.INVESTOR_RELATIONS,
            },
        ],
    },
    {
        translationPath: 'footer.getStarted',
        rows: [
            {
                onPress: () => navigateFocus(),
                translationPath: 'footer.createAccount',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.CREATE_ACCOUNT,
            },
            {
                onPress: () => navigateFocus(),
                translationPath: 'footer.logIn',
                sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK.LOG_IN,
            },
        ],
    },
];

function Footer({navigateFocus}: FooterProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyFooterLogo', 'ExpensifyFooterLogoVertical']);
    const isVertical = shouldUseNarrowLayout;
    const imageDirection = isVertical ? styles.flexRow : styles.flexColumn;
    const imageStyle = isVertical ? styles.pr0 : styles.alignSelfCenter;
    const columnDirection = isVertical ? styles.flexColumn : styles.flexRow;
    const pageFooterWrapper = [styles.footerWrapper, imageDirection, imageStyle, isVertical ? styles.pl10 : {}];
    const footerColumns = [styles.footerColumnsContainer, columnDirection];
    const footerColumn = isVertical ? [styles.p4] : [styles.p4, isMediumScreenWidth ? styles.w50 : styles.w25];
    const footerWrapper = isVertical ? [StyleUtils.getBackgroundColorStyle(theme.signInPage), styles.overflowHidden] : [];
    const getTextLinkStyle: (hovered: boolean) => StyleProp<TextStyle> = (hovered) => [styles.footerRow, hovered ? styles.textBlue : {}];
    return (
        <View style={[styles.flex1]}>
            <View style={footerWrapper}>
                {isVertical ? (
                    <View style={styles.signInPageGradientMobile}>
                        <ImageSVG
                            src={SignInGradient}
                            height="100%"
                        />
                    </View>
                ) : null}
                <View style={pageFooterWrapper}>
                    <View style={footerColumns}>
                        {columns({navigateFocus}).map((column, i) => (
                            <View
                                key={column.translationPath}
                                style={footerColumn}
                            >
                                <Text
                                    style={[styles.textHeadline, styles.footerTitle]}
                                    accessibilityRole={CONST.ROLE.HEADER}
                                    aria-level={2}
                                >
                                    {translate(column.translationPath)}
                                </Text>
                                <View style={[styles.footerRow]}>
                                    {column.rows.map((row) => (
                                        <Hoverable key={row.translationPath}>
                                            {(hovered) =>
                                                row.onPress ? (
                                                    <FooterRow
                                                        onPress={row.onPress}
                                                        sentryLabel={row.sentryLabel}
                                                        text={translate(row.translationPath)}
                                                        style={getTextLinkStyle(hovered)}
                                                    />
                                                ) : (
                                                    <FooterRow
                                                        href={row.href}
                                                        sentryLabel={row.sentryLabel}
                                                        text={translate(row.translationPath)}
                                                        style={getTextLinkStyle(hovered)}
                                                    />
                                                )
                                            }
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
                            <ImageSVG src={icons.ExpensifyFooterLogo} />
                        ) : (
                            <ImageSVG
                                src={icons.ExpensifyFooterLogoVertical}
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

export default Footer;

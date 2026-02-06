import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import SignInGradient from '@assets/images/home-fade-gradient--mobile.svg';
import Hoverable from '@components/Hoverable';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import type {LinkProps, PressProps} from '@components/TextLink';
import TextLink from '@components/TextLink';
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
import type {SignInPageLayoutProps} from './types';

type FooterProps = Pick<SignInPageLayoutProps, 'navigateFocus'>;

type FooterColumnRow = (LinkProps | PressProps) & {
    translationPath: TranslationPaths;
};

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
            },
            {
                href: CONST.FOOTER.SPEND_MANAGEMENT_URL,
                translationPath: 'footer.spendManagement',
            },
            {
                href: CONST.FOOTER.EXPENSE_REPORTS_URL,
                translationPath: 'footer.expenseReports',
            },
            {
                href: CONST.FOOTER.COMPANY_CARD_URL,
                translationPath: 'footer.companyCreditCard',
            },
            {
                href: CONST.FOOTER.RECEIPT_SCANNING_URL,
                translationPath: 'footer.receiptScanningApp',
            },
            {
                href: CONST.FOOTER.BILL_PAY_URL,
                translationPath: 'footer.billPay',
            },
            {
                href: CONST.FOOTER.INVOICES_URL,
                translationPath: 'footer.invoicing',
            },
            {
                href: CONST.FOOTER.PAYROLL_URL,
                translationPath: 'footer.payroll',
            },
            {
                href: CONST.FOOTER.TRAVEL_URL,
                translationPath: 'footer.travel',
            },
        ],
    },
    {
        translationPath: 'footer.resources',
        rows: [
            {
                href: CONST.FOOTER.EXPENSIFY_APPROVED_URL,
                translationPath: 'footer.expensifyApproved',
            },
            {
                href: CONST.FOOTER.PRESS_KIT_URL,
                translationPath: 'footer.pressKit',
            },
            {
                href: CONST.FOOTER.SUPPORT_URL,
                translationPath: 'footer.support',
            },
            {
                href: CONST.NEWHELP_URL,
                translationPath: 'footer.expensifyHelp',
            },
            {
                href: CONST.FOOTER.TERMS_URL,
                translationPath: 'footer.terms',
            },
            {
                href: CONST.FOOTER.PRIVACY_URL,
                translationPath: 'footer.privacy',
            },
        ],
    },
    {
        translationPath: 'footer.learnMore',
        rows: [
            {
                href: CONST.FOOTER.ABOUT_URL,
                translationPath: 'footer.aboutExpensify',
            },
            {
                href: CONST.FOOTER.BLOG_URL,
                translationPath: 'footer.blog',
            },
            {
                href: CONST.FOOTER.JOBS_URL,
                translationPath: 'footer.jobs',
            },
            {
                href: CONST.FOOTER.ORG_URL,
                translationPath: 'footer.expensifyOrg',
            },
            {
                href: CONST.FOOTER.INVESTOR_RELATIONS_URL,
                translationPath: 'footer.investorRelations',
            },
        ],
    },
    {
        translationPath: 'footer.getStarted',
        rows: [
            {
                onPress: () => navigateFocus(),
                translationPath: 'footer.createAccount',
            },
            {
                onPress: () => navigateFocus(),
                translationPath: 'footer.logIn',
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
                                    accessibilityRole="header"
                                >
                                    {translate(column.translationPath)}
                                </Text>
                                <View style={[styles.footerRow]}>
                                    {column.rows.map(({href, onPress, translationPath}) => (
                                        <Hoverable key={translationPath}>
                                            {(hovered) => (
                                                <View>
                                                    {onPress ? (
                                                        <TextLink
                                                            style={getTextLinkStyle(hovered)}
                                                            onPress={onPress}
                                                        >
                                                            {translate(translationPath)}
                                                        </TextLink>
                                                    ) : (
                                                        <TextLink
                                                            style={getTextLinkStyle(hovered)}
                                                            href={href}
                                                        >
                                                            {translate(translationPath)}
                                                        </TextLink>
                                                    )}
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

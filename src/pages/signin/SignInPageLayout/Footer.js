"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var home_fade_gradient__mobile_svg_1 = require("@assets/images/home-fade-gradient--mobile.svg");
var Hoverable_1 = require("@components/Hoverable");
var Expensicons = require("@components/Icon/Expensicons");
var ImageSVG_1 = require("@components/ImageSVG");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Licenses_1 = require("@pages/signin/Licenses");
var Socials_1 = require("@pages/signin/Socials");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var columns = function (_a) {
    var _b = _a.navigateFocus, navigateFocus = _b === void 0 ? function () { } : _b;
    return [
        {
            translationPath: 'footer.features',
            rows: [
                {
                    href: CONST_1.default.FOOTER.EXPENSE_MANAGEMENT_URL,
                    translationPath: 'footer.expenseManagement',
                },
                {
                    href: CONST_1.default.FOOTER.SPEND_MANAGEMENT_URL,
                    translationPath: 'footer.spendManagement',
                },
                {
                    href: CONST_1.default.FOOTER.EXPENSE_REPORTS_URL,
                    translationPath: 'footer.expenseReports',
                },
                {
                    href: CONST_1.default.FOOTER.COMPANY_CARD_URL,
                    translationPath: 'footer.companyCreditCard',
                },
                {
                    href: CONST_1.default.FOOTER.RECEIPT_SCANNING_URL,
                    translationPath: 'footer.receiptScanningApp',
                },
                {
                    href: CONST_1.default.FOOTER.BILL_PAY_URL,
                    translationPath: 'footer.billPay',
                },
                {
                    href: CONST_1.default.FOOTER.INVOICES_URL,
                    translationPath: 'footer.invoicing',
                },
                {
                    href: CONST_1.default.FOOTER.PAYROLL_URL,
                    translationPath: 'footer.payroll',
                },
                {
                    href: CONST_1.default.FOOTER.TRAVEL_URL,
                    translationPath: 'footer.travel',
                },
            ],
        },
        {
            translationPath: 'footer.resources',
            rows: [
                {
                    href: CONST_1.default.FOOTER.EXPENSIFY_APPROVED_URL,
                    translationPath: 'footer.expensifyApproved',
                },
                {
                    href: CONST_1.default.FOOTER.PRESS_KIT_URL,
                    translationPath: 'footer.pressKit',
                },
                {
                    href: CONST_1.default.FOOTER.SUPPORT_URL,
                    translationPath: 'footer.support',
                },
                {
                    href: CONST_1.default.NEWHELP_URL,
                    translationPath: 'footer.expensifyHelp',
                },
                {
                    href: CONST_1.default.FOOTER.TERMS_URL,
                    translationPath: 'footer.terms',
                },
                {
                    href: CONST_1.default.FOOTER.PRIVACY_URL,
                    translationPath: 'footer.privacy',
                },
            ],
        },
        {
            translationPath: 'footer.learnMore',
            rows: [
                {
                    href: CONST_1.default.FOOTER.ABOUT_URL,
                    translationPath: 'footer.aboutExpensify',
                },
                {
                    href: CONST_1.default.FOOTER.BLOG_URL,
                    translationPath: 'footer.blog',
                },
                {
                    href: CONST_1.default.FOOTER.JOBS_URL,
                    translationPath: 'footer.jobs',
                },
                {
                    href: CONST_1.default.FOOTER.ORG_URL,
                    translationPath: 'footer.expensifyOrg',
                },
                {
                    href: CONST_1.default.FOOTER.INVESTOR_RELATIONS_URL,
                    translationPath: 'footer.investorRelations',
                },
            ],
        },
        {
            translationPath: 'footer.getStarted',
            rows: [
                {
                    onPress: function () { return navigateFocus(); },
                    translationPath: 'footer.createAccount',
                },
                {
                    onPress: function () { return navigateFocus(); },
                    translationPath: 'footer.logIn',
                },
            ],
        },
    ];
};
function Footer(_a) {
    var navigateFocus = _a.navigateFocus;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _b.shouldUseNarrowLayout, isMediumScreenWidth = _b.isMediumScreenWidth;
    var isVertical = shouldUseNarrowLayout;
    var imageDirection = isVertical ? styles.flexRow : styles.flexColumn;
    var imageStyle = isVertical ? styles.pr0 : styles.alignSelfCenter;
    var columnDirection = isVertical ? styles.flexColumn : styles.flexRow;
    var pageFooterWrapper = [styles.footerWrapper, imageDirection, imageStyle, isVertical ? styles.pl10 : {}];
    var footerColumns = [styles.footerColumnsContainer, columnDirection];
    var footerColumn = isVertical ? [styles.p4] : [styles.p4, isMediumScreenWidth ? styles.w50 : styles.w25];
    var footerWrapper = isVertical ? [StyleUtils.getBackgroundColorStyle(theme.signInPage), styles.overflowHidden] : [];
    var getTextLinkStyle = function (hovered) { return [styles.footerRow, hovered ? styles.textBlue : {}]; };
    return (<react_native_1.View style={[styles.flex1]}>
            <react_native_1.View style={footerWrapper}>
                {isVertical ? (<react_native_1.View style={[styles.signInPageGradientMobile]}>
                        <ImageSVG_1.default src={home_fade_gradient__mobile_svg_1.default} height="100%"/>
                    </react_native_1.View>) : null}
                <react_native_1.View style={pageFooterWrapper}>
                    <react_native_1.View style={footerColumns}>
                        {columns({ navigateFocus: navigateFocus }).map(function (column, i) { return (<react_native_1.View key={column.translationPath} style={footerColumn}>
                                <Text_1.default style={[styles.textHeadline, styles.footerTitle]}>{translate(column.translationPath)}</Text_1.default>
                                <react_native_1.View style={[styles.footerRow]}>
                                    {column.rows.map(function (_a) {
                var href = _a.href, onPress = _a.onPress, translationPath = _a.translationPath;
                return (<Hoverable_1.default key={translationPath}>
                                            {function (hovered) { return (<react_native_1.View>
                                                    {onPress ? (<TextLink_1.default style={getTextLinkStyle(hovered)} onPress={onPress}>
                                                            {translate(translationPath)}
                                                        </TextLink_1.default>) : (<TextLink_1.default style={getTextLinkStyle(hovered)} href={href}>
                                                            {translate(translationPath)}
                                                        </TextLink_1.default>)}
                                                </react_native_1.View>); }}
                                        </Hoverable_1.default>);
            })}
                                    {i === 2 && (<react_native_1.View style={styles.mt4}>
                                            <Socials_1.default />
                                        </react_native_1.View>)}
                                    {i === 3 && (<react_native_1.View style={styles.mv4}>
                                            <Licenses_1.default />
                                        </react_native_1.View>)}
                                </react_native_1.View>
                            </react_native_1.View>); })}
                    </react_native_1.View>
                    <react_native_1.View style={[!isVertical && styles.footerBottomLogo]}>
                        {!isVertical ? (<ImageSVG_1.default src={Expensicons.ExpensifyFooterLogo}/>) : (<ImageSVG_1.default src={Expensicons.ExpensifyFooterLogoVertical} height={variables_1.default.verticalLogoHeight} width={variables_1.default.verticalLogoWidth}/>)}
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
Footer.displayName = 'Footer';
exports.default = Footer;

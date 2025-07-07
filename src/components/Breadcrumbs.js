"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var expensify_wordmark_svg_1 = require("@assets/images/expensify-wordmark.svg");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var Header_1 = require("./Header");
var ImageSVG_1 = require("./ImageSVG");
var Text_1 = require("./Text");
function Breadcrumbs(_a) {
    var breadcrumbs = _a.breadcrumbs, style = _a.style;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var primaryBreadcrumb = breadcrumbs[0], secondaryBreadcrumb = breadcrumbs[1];
    var isRootBreadcrumb = primaryBreadcrumb.type === CONST_1.default.BREADCRUMB_TYPE.ROOT;
    var fontScale = react_native_1.PixelRatio.getFontScale() > CONST_1.default.LOGO_MAX_SCALE ? CONST_1.default.LOGO_MAX_SCALE : react_native_1.PixelRatio.getFontScale();
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.w100, styles.breadcrumbsContainer, style]}>
            {isRootBreadcrumb ? (<react_native_1.View style={styles.breadcrumbLogo}>
                    <Header_1.default title={<ImageSVG_1.default contentFit="contain" src={expensify_wordmark_svg_1.default} fill={theme.text} width={variables_1.default.lhnLogoWidth * fontScale} height={variables_1.default.lhnLogoHeight * fontScale}/>} style={styles.justifyContentCenter} shouldShowEnvironmentBadge/>
                </react_native_1.View>) : (<Text_1.default numberOfLines={1} style={[styles.flexShrink1, styles.breadcrumb, styles.breadcrumbStrong]}>
                    {primaryBreadcrumb.text}
                </Text_1.default>)}

            {!!secondaryBreadcrumb && (<>
                    <Text_1.default style={[styles.breadcrumbSeparator]}>/</Text_1.default>
                    <Text_1.default numberOfLines={1} style={[styles.mw75, styles.breadcrumb, isRootBreadcrumb ? styles.flex1 : styles.flexShrink0]}>
                        {secondaryBreadcrumb.text}
                    </Text_1.default>
                </>)}
        </react_native_1.View>);
}
Breadcrumbs.displayName = 'Breadcrumbs';
exports.default = Breadcrumbs;

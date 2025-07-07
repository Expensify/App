"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Expensicons = require("@components/Icon/Expensicons");
var ImageSVG_1 = require("@components/ImageSVG");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function EmptyMoneyRequestReportPreview(_a) {
    var emptyReportPreviewAction = _a.emptyReportPreviewAction;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return (<react_native_1.View style={[styles.alignItemsCenter, styles.highlightBG, styles.ml0, styles.mr0, styles.gap4, styles.reportContainerBorderRadius]}>
            <react_native_1.View style={[styles.emptyStateMoneyRequestPreviewReport, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <react_native_1.View style={[styles.m1, styles.justifyContentCenter, styles.alignItemsCenter, styles.gap4]}>
                    <ImageSVG_1.default fill={theme.border} height={64} width={64} src={Expensicons.Folder}/>
                    <Text_1.default style={[styles.textAlignCenter, styles.textSupporting, styles.fontSizeLabel]}>{translate('search.moneyRequestReport.emptyStateTitle')}</Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={[{ width: shouldUseNarrowLayout ? '100%' : 303, height: 40 }]}>{!!emptyReportPreviewAction && emptyReportPreviewAction}</react_native_1.View>
        </react_native_1.View>);
}
EmptyMoneyRequestReportPreview.displayName = 'EmptyRequestReport';
exports.default = EmptyMoneyRequestReportPreview;

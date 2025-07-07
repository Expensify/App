"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Accordion_1 = require("@components/Accordion");
var Icon_1 = require("@components/Icon");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var RenderHTML_1 = require("@components/RenderHTML");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var useAccordionAnimation_1 = require("@hooks/useAccordionAnimation");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Parser_1 = require("@libs/Parser");
var ICON_SIZE = 48;
function ToggleSettingOptionRow(_a) {
    var icon = _a.icon, title = _a.title, customTitle = _a.customTitle, subtitle = _a.subtitle, subtitleStyle = _a.subtitleStyle, accordionStyle = _a.accordionStyle, switchAccessibilityLabel = _a.switchAccessibilityLabel, shouldPlaceSubtitleBelowSwitch = _a.shouldPlaceSubtitleBelowSwitch, _b = _a.shouldEscapeText, shouldEscapeText = _b === void 0 ? undefined : _b, _c = _a.shouldParseSubtitle, shouldParseSubtitle = _c === void 0 ? false : _c, wrapperStyle = _a.wrapperStyle, titleStyle = _a.titleStyle, onToggle = _a.onToggle, subMenuItems = _a.subMenuItems, isActive = _a.isActive, disabledAction = _a.disabledAction, pendingAction = _a.pendingAction, errors = _a.errors, onCloseError = _a.onCloseError, _d = _a.disabled, disabled = _d === void 0 ? false : _d, _e = _a.showLockIcon, showLockIcon = _e === void 0 ? false : _e;
    var styles = (0, useThemeStyles_1.default)();
    var _f = (0, useAccordionAnimation_1.default)(isActive), isAccordionExpanded = _f.isAccordionExpanded, shouldAnimateAccordionSection = _f.shouldAnimateAccordionSection;
    (0, react_1.useEffect)(function () {
        isAccordionExpanded.set(isActive);
    }, [isAccordionExpanded, isActive]);
    var subtitleHtml = (0, react_1.useMemo)(function () {
        if (!subtitle || !shouldParseSubtitle || typeof subtitle !== 'string') {
            return '';
        }
        return Parser_1.default.replace(subtitle, { shouldEscapeText: shouldEscapeText });
    }, [subtitle, shouldParseSubtitle, shouldEscapeText]);
    var processedSubtitle = (0, react_1.useMemo)(function () {
        var textToWrap = '';
        if (shouldParseSubtitle) {
            textToWrap = subtitleHtml;
        }
        return textToWrap ? "<comment><muted-text-label>".concat(textToWrap, "</muted-text-label></comment>") : '';
    }, [shouldParseSubtitle, subtitleHtml]);
    var subTitleView = (0, react_1.useMemo)(function () {
        if (typeof subtitle === 'string') {
            if (!!subtitle && shouldParseSubtitle) {
                return (<react_native_1.View style={[styles.flexRow, styles.renderHTML, shouldPlaceSubtitleBelowSwitch ? styles.mt1 : __assign(__assign({}, styles.mt1), styles.mr5)]}>
                        <RenderHTML_1.default html={processedSubtitle}/>
                    </react_native_1.View>);
            }
            return <Text_1.default style={[styles.mutedNormalTextLabel, shouldPlaceSubtitleBelowSwitch ? styles.mt1 : __assign(__assign({}, styles.mt1), styles.mr5), subtitleStyle]}>{subtitle}</Text_1.default>;
        }
        return subtitle;
    }, [
        subtitle,
        shouldParseSubtitle,
        styles.mutedNormalTextLabel,
        styles.mt1,
        styles.mr5,
        styles.flexRow,
        styles.renderHTML,
        shouldPlaceSubtitleBelowSwitch,
        subtitleStyle,
        processedSubtitle,
    ]);
    return (<OfflineWithFeedback_1.default pendingAction={pendingAction} errors={errors} errorRowStyles={[styles.mt2]} style={[wrapperStyle]} onClose={onCloseError}>
            <react_native_1.View style={styles.pRelative}>
                <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, shouldPlaceSubtitleBelowSwitch && styles.h10]}>
                    <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                        {!!icon && (<Icon_1.default src={icon} height={ICON_SIZE} width={ICON_SIZE} additionalStyles={[styles.mr3]}/>)}
                        {customTitle !== null && customTitle !== void 0 ? customTitle : (<react_native_1.View style={[styles.flexColumn, styles.flex1]}>
                                <Text_1.default style={[styles.textNormal, styles.lh20, titleStyle]}>{title}</Text_1.default>
                                {!shouldPlaceSubtitleBelowSwitch && subtitle && subTitleView}
                            </react_native_1.View>)}
                    </react_native_1.View>
                    <Switch_1.default disabledAction={disabledAction} accessibilityLabel={switchAccessibilityLabel} onToggle={function (isOn) {
            shouldAnimateAccordionSection.set(true);
            onToggle(isOn);
        }} isOn={isActive} disabled={disabled} showLockIcon={showLockIcon}/>
                </react_native_1.View>
                {shouldPlaceSubtitleBelowSwitch && subtitle && subTitleView}
                <Accordion_1.default isExpanded={isAccordionExpanded} style={accordionStyle} isToggleTriggered={shouldAnimateAccordionSection}>
                    {subMenuItems}
                </Accordion_1.default>
            </react_native_1.View>
        </OfflineWithFeedback_1.default>);
}
exports.default = ToggleSettingOptionRow;

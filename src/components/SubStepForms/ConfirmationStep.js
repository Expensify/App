"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var DotIndicatorMessage_1 = require("@components/DotIndicatorMessage");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function ConfirmationStep(_a) {
    var pageTitle = _a.pageTitle, summaryItems = _a.summaryItems, showOnfidoLinks = _a.showOnfidoLinks, onfidoLinksTitle = _a.onfidoLinksTitle, isLoading = _a.isLoading, error = _a.error, onNext = _a.onNext, _b = _a.shouldApplySafeAreaPaddingBottom, shouldApplySafeAreaPaddingBottom = _b === void 0 ? true : _b;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var safeAreaInsetPaddingBottom = (0, useSafeAreaPaddings_1.default)().paddingBottom;
    return (<ScrollView_1.default style={styles.flex1} contentContainerStyle={[styles.flexGrow1, shouldApplySafeAreaPaddingBottom && { paddingBottom: safeAreaInsetPaddingBottom + styles.pb5.paddingBottom }]}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{pageTitle}</Text_1.default>
            {summaryItems.map(function (_a) {
            var description = _a.description, title = _a.title, shouldShowRightIcon = _a.shouldShowRightIcon, onPress = _a.onPress;
            return (<MenuItemWithTopDescription_1.default key={"".concat(title, "_").concat(description)} description={description} title={title} shouldShowRightIcon={shouldShowRightIcon} onPress={onPress}/>);
        })}

            {showOnfidoLinks && (<Text_1.default style={[styles.mt3, styles.ph5, styles.textMicroSupporting]}>
                    {onfidoLinksTitle}
                    <TextLink_1.default href={CONST_1.default.ONFIDO_FACIAL_SCAN_POLICY_URL} style={[styles.textMicro]}>
                        {translate('onfidoStep.facialScan')}
                    </TextLink_1.default>
                    {', '}
                    <TextLink_1.default href={CONST_1.default.ONFIDO_PRIVACY_POLICY_URL} style={[styles.textMicro]}>
                        {translate('common.privacy')}
                    </TextLink_1.default>
                    {" ".concat(translate('common.and'), " ")}
                    <TextLink_1.default href={CONST_1.default.ONFIDO_TERMS_OF_SERVICE_URL} style={[styles.textMicro]}>
                        {translate('common.termsOfService')}
                    </TextLink_1.default>
                </Text_1.default>)}

            <react_native_1.View style={[styles.ph5, styles.mt5, styles.flexGrow1, styles.justifyContentEnd]}>
                {!!error && error.length > 0 && (<DotIndicatorMessage_1.default textStyles={[styles.formError]} type="error" messages={{ error: error }}/>)}
                <Button_1.default isDisabled={isOffline} success large isLoading={isLoading} style={[styles.w100]} onPress={onNext} text={translate('common.confirm')}/>
            </react_native_1.View>
        </ScrollView_1.default>);
}
ConfirmationStep.displayName = 'ConfirmationStep';
exports.default = ConfirmationStep;

"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var RenderHTML_1 = require("@components/RenderHTML");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Policy_1 = require("@src/libs/actions/Policy/Policy");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function PayAndDowngradePage() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.BILLING_RECEIPT_DETAILS, { canBeMissing: true }), billingDetails = _b[0], metadata = _b[1];
    var prevIsLoading = (0, usePrevious_1.default)(billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.isLoading);
    var errorMessage = billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.errors;
    var items = (0, react_1.useMemo)(function () {
        if ((0, EmptyObject_1.isEmptyObject)(billingDetails)) {
            return [];
        }
        var results = __spreadArray(__spreadArray([], billingDetails.receiptsWithoutDiscount, true), billingDetails.discounts, true).map(function (item) {
            return {
                key: item.description,
                value: item.formattedAmount,
                isTotal: false,
            };
        });
        results.push({
            key: translate('common.total'),
            value: billingDetails.formattedSubtotal,
            isTotal: true,
        });
        return results;
    }, [billingDetails, translate]);
    (0, react_1.useEffect)(function () {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if ((billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.isLoading) || !prevIsLoading || (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.errors)) {
            return;
        }
        Navigation_1.default.dismissModal();
    }, [billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.isLoading, prevIsLoading, billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.errors]);
    (0, react_1.useEffect)(function () {
        (0, Policy_1.clearBillingReceiptDetailsErrors)();
    }, []);
    if ((0, isLoadingOnyxValue_1.default)(metadata)) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<ScreenWrapper_1.default shouldShowOfflineIndicator testID="PayAndDowngradePage" offlineIndicatorStyle={styles.mtAuto}>
            <FullPageNotFoundView_1.default shouldShow={(0, EmptyObject_1.isEmptyObject)(billingDetails)}>
                <HeaderWithBackButton_1.default title={translate('workspace.payAndDowngrade.title')}/>
                <FullPageOfflineBlockingView_1.default>
                    <ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pt3]}>
                        <Text_1.default style={[styles.textHeadlineH1, styles.mb5]}>{translate('workspace.payAndDowngrade.headline')}</Text_1.default>
                        <Text_1.default>
                            {translate('workspace.payAndDowngrade.description1')} <Text_1.default style={[styles.textBold]}>{billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.formattedSubtotal}</Text_1.default>
                        </Text_1.default>
                        <Text_1.default style={[styles.mb5]}>
                            {translate('workspace.payAndDowngrade.description2', {
            date: (_a = billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.billingMonth) !== null && _a !== void 0 ? _a : '',
        })}
                        </Text_1.default>

                        <react_native_1.View style={[styles.borderedContentCard, styles.ph5, styles.pv2, styles.mb5]}>
                            {items.map(function (item) { return (<react_native_1.View key={item.key} style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap8, styles.pv3, !item.isTotal ? styles.borderBottom : undefined]}>
                                    {!item.isTotal ? <RenderHTML_1.default html={item.key}/> : <Text_1.default style={styles.textBold}>{item.key}</Text_1.default>}
                                    <Text_1.default style={item.isTotal ? styles.textBold : undefined}>{item.value}</Text_1.default>
                                </react_native_1.View>); })}
                        </react_native_1.View>
                        <Text_1.default style={[styles.textLabelSupportingNormal]}>{translate('workspace.payAndDowngrade.subscription')}</Text_1.default>
                    </ScrollView_1.default>
                    <FixedFooter_1.default style={[styles.mtAuto, styles.pt5]}>
                        {!!errorMessage && (<react_native_1.View style={[styles.mb3]}>
                                <FormHelpMessage_1.default isError message={errorMessage}/>
                            </react_native_1.View>)}
                        <Button_1.default large danger text={translate('workspace.payAndDowngrade.title')} onPress={Policy_1.payAndDowngrade} pressOnEnter isLoading={billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.isLoading}/>
                    </FixedFooter_1.default>
                </FullPageOfflineBlockingView_1.default>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
exports.default = PayAndDowngradePage;

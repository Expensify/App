"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var SelectCircle_1 = require("@components/SelectCircle");
var Text_1 = require("@components/Text");
var useOnyx_1 = require("@hooks/useOnyx");
var usePreferredCurrency_1 = require("@hooks/usePreferredCurrency");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSubscriptionPlan_1 = require("@hooks/useSubscriptionPlan");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var variables_1 = require("@styles/variables");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SubscriptionPlanCardActionButton_1 = require("./SubscriptionPlanCardActionButton");
function SubscriptionPlanCard(_a) {
    var subscriptionPlan = _a.subscriptionPlan, _b = _a.isFromComparisonModal, isFromComparisonModal = _b === void 0 ? false : _b, closeComparisonModal = _a.closeComparisonModal;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var currentSubscriptionPlan = (0, useSubscriptionPlan_1.default)();
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION)[0];
    var preferredCurrency = (0, usePreferredCurrency_1.default)();
    var _c = (0, SubscriptionUtils_1.getSubscriptionPlanInfo)(subscriptionPlan, privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type, preferredCurrency, isFromComparisonModal), title = _c.title, src = _c.src, description = _c.description, benefits = _c.benefits, note = _c.note, subtitle = _c.subtitle;
    var isSelected = isFromComparisonModal && subscriptionPlan === currentSubscriptionPlan;
    var benefitsColumns = shouldUseNarrowLayout || isFromComparisonModal ? 1 : 2;
    var renderBenefits = function () {
        var amountOfRows = Math.ceil(benefits.length / benefitsColumns);
        return Array.from({ length: amountOfRows }).map(function (_, rowIndex) { return (<react_native_1.View 
        // eslint-disable-next-line react/no-array-index-key
        key={"row-".concat(rowIndex)} style={styles.flexRow}>
                {benefits.slice(rowIndex * benefitsColumns, (rowIndex + 1) * benefitsColumns).map(function (item) { return (<react_native_1.View key={item} style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, shouldUseNarrowLayout ? styles.mt3 : styles.mt4]}>
                        <Icon_1.default src={Expensicons.Checkmark} fill={theme.iconSuccessFill} width={variables_1.default.iconSizeSmall} height={variables_1.default.iconSizeSmall}/>
                        <Text_1.default style={[styles.textLabelSupporting, styles.ml2]}>{item}</Text_1.default>
                    </react_native_1.View>); })}
            </react_native_1.View>); });
    };
    return (<react_native_1.View style={[styles.borderedContentCard, styles.borderRadiusComponentLarge, styles.mt5, styles.flex1, isSelected && styles.borderColorFocus, styles.justifyContentBetween]}>
            <react_native_1.View style={shouldUseNarrowLayout ? styles.p5 : [styles.p8, styles.pb6]}>
                <react_native_1.View style={[styles.flexRow, styles.justifyContentBetween]}>
                    <Icon_1.default src={src} width={variables_1.default.iconHeader} height={variables_1.default.iconHeader}/>
                    <react_native_1.View>
                        <SelectCircle_1.default isChecked={isSelected} selectCircleStyles={[styles.bgTransparent, styles.borderNone]}/>
                    </react_native_1.View>
                </react_native_1.View>
                <Text_1.default style={[styles.headerText, styles.mv2, styles.textHeadlineH2]}>{title}</Text_1.default>
                <Text_1.default style={styles.labelStrong}>{subtitle}</Text_1.default>
                <Text_1.default style={[styles.textLabelSupporting, styles.textSmall]}>{note}</Text_1.default>
                <Text_1.default style={[styles.textLabelSupporting, styles.textNormal, styles.mt3, styles.mb1]}>{description}</Text_1.default>
                {renderBenefits()}
            </react_native_1.View>
            <react_native_1.View style={shouldUseNarrowLayout ? styles.pb5 : styles.pb8}>
                <SubscriptionPlanCardActionButton_1.default subscriptionPlan={subscriptionPlan} isFromComparisonModal={isFromComparisonModal} isSelected={isSelected} style={shouldUseNarrowLayout ? styles.ph5 : styles.ph8} closeComparisonModal={closeComparisonModal}/>
            </react_native_1.View>
        </react_native_1.View>);
}
SubscriptionPlanCard.displayName = 'SubscriptionPlanCard';
exports.default = SubscriptionPlanCard;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Illustrations_1 = require("@components/Icon/Illustrations");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var BillingBanner_1 = require("@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner");
function WorkspaceCompanyCardExpensifyCardPromotionBanner(_a) {
    var policy = _a.policy;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var StyleUtils = (0, useStyleUtils_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var areExpensifyCardsEnabled = policy === null || policy === void 0 ? void 0 : policy.areExpensifyCardsEnabled;
    var handleLearnMore = (0, react_1.useCallback)(function () {
        if (!policyID) {
            return;
        }
        if (areExpensifyCardsEnabled) {
            (0, PolicyUtils_1.navigateToExpensifyCardPage)(policyID);
            return;
        }
        (0, Policy_1.enableExpensifyCard)(policyID, true, true);
    }, [policyID, areExpensifyCardsEnabled]);
    var rightComponent = (0, react_1.useMemo)(function () {
        var smallScreenStyle = shouldUseNarrowLayout ? [styles.flex0, styles.flexBasis100, styles.justifyContentCenter] : [];
        return (<react_native_1.View style={[styles.flexRow, styles.gap2, smallScreenStyle]}>
                <Button_1.default success onPress={handleLearnMore} style={shouldUseNarrowLayout && styles.flex1} text={translate('workspace.moreFeatures.companyCards.expensifyCardBannerLearnMoreButton')}/>
            </react_native_1.View>);
    }, [styles, shouldUseNarrowLayout, translate, handleLearnMore]);
    return (<react_native_1.View style={[styles.ph4, styles.mb4]}>
            <BillingBanner_1.default icon={Illustrations_1.CreditCardsNewGreen} title={translate('workspace.moreFeatures.companyCards.expensifyCardBannerTitle')} titleStyle={StyleUtils.getTextColorStyle(theme.text)} subtitle={translate('workspace.moreFeatures.companyCards.expensifyCardBannerSubtitle')} subtitleStyle={[styles.mt1, styles.textLabel]} style={[styles.borderRadiusComponentLarge]} rightComponent={rightComponent}/>
        </react_native_1.View>);
}
exports.default = WorkspaceCompanyCardExpensifyCardPromotionBanner;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var SubscriptionPlanCard_1 = require("./SubscriptionPlanCard");
function ComparePlansModal(_a) {
    var isModalVisible = _a.isModalVisible, setIsModalVisible = _a.setIsModalVisible;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to be consistent with BaseModal component
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var _b = (0, react_1.useState)('slideOutRight'), animationOut = _b[0], setAnimationOut = _b[1];
    (0, react_1.useEffect)(function () {
        setAnimationOut('slideOutRight');
    }, [isModalVisible]);
    var closeComparisonModalWithFadeOutAnimation = function () {
        setAnimationOut('fadeOut');
        setIsModalVisible(false);
    };
    var renderPlans = function () { return (<react_native_1.View style={isSmallScreenWidth ? [styles.ph4, styles.pb8] : [styles.ph8, styles.pb8]}>
            <Text_1.default style={[styles.textLabelSupporting, styles.textNormal]}>
                {translate('subscription.compareModal.unlockTheFeatures')}
                <TextLink_1.default href={CONST_1.default.PRICING}>{translate('subscription.compareModal.viewOurPricing')}</TextLink_1.default>
                {translate('subscription.compareModal.forACompleteFeatureBreakdown')}
            </Text_1.default>
            <react_native_1.View style={isSmallScreenWidth ? styles.flexColumn : [styles.flexRow, styles.gap3]}>
                <SubscriptionPlanCard_1.default subscriptionPlan={CONST_1.default.POLICY.TYPE.TEAM} closeComparisonModal={closeComparisonModalWithFadeOutAnimation} isFromComparisonModal/>
                <SubscriptionPlanCard_1.default subscriptionPlan={CONST_1.default.POLICY.TYPE.CORPORATE} closeComparisonModal={closeComparisonModalWithFadeOutAnimation} isFromComparisonModal/>
            </react_native_1.View>
        </react_native_1.View>); };
    return (<Modal_1.default isVisible={isModalVisible} type={isSmallScreenWidth ? CONST_1.default.MODAL.MODAL_TYPE.CENTERED : CONST_1.default.MODAL.MODAL_TYPE.CENTERED_SMALL} onClose={function () { return setIsModalVisible(false); }} animationOut={isSmallScreenWidth ? animationOut : undefined} innerContainerStyle={isSmallScreenWidth ? undefined : styles.workspaceSection}>
            <HeaderWithBackButton_1.default title={translate('subscription.compareModal.comparePlans')} shouldShowCloseButton onCloseButtonPress={function () { return setIsModalVisible(false); }} shouldShowBackButton={false} style={isSmallScreenWidth ? styles.pl4 : [styles.pr3, styles.pl8]}/>
            {isSmallScreenWidth ? <ScrollView_1.default addBottomSafeAreaPadding>{renderPlans()}</ScrollView_1.default> : renderPlans()}
        </Modal_1.default>);
}
exports.default = ComparePlansModal;

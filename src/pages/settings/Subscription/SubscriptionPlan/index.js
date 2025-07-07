"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Illustrations = require("@components/Icon/Illustrations");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useSubscriptionPlan_1 = require("@hooks/useSubscriptionPlan");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var ComparePlansModal_1 = require("./ComparePlansModal");
var SaveWithExpensifyButton_1 = require("./SaveWithExpensifyButton");
var SubscriptionPlanCard_1 = require("./SubscriptionPlanCard");
function SubscriptionPlan() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var subscriptionPlan = (0, useSubscriptionPlan_1.default)();
    var _a = (0, react_1.useState)(false), isModalVisible = _a[0], setIsModalVisible = _a[1];
    var renderTitle = function () {
        return (<react_native_1.View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <Text_1.default style={[styles.textHeadline, styles.cardSectionTitle, styles.textStrong]}>{translate('subscription.yourPlan.title')}</Text_1.default>
                <Button_1.default small text={translate('subscription.yourPlan.exploreAllPlans')} onPress={function () { return setIsModalVisible(true); }}/>
            </react_native_1.View>);
    };
    return (<Section_1.default renderTitle={renderTitle} isCentralPane>
            <SubscriptionPlanCard_1.default subscriptionPlan={subscriptionPlan}/>
            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mt6]}>
                <Icon_1.default src={Illustrations.HandCard} width={variables_1.default.iconHeader} height={variables_1.default.iconHeader} additionalStyles={styles.mr2}/>
                <react_native_1.View style={[styles.flexColumn, styles.justifyContentCenter, styles.flex1, styles.mr2]}>
                    <Text_1.default style={[styles.headerText, styles.mt2]}>{translate('subscription.yourPlan.saveWithExpensifyTitle')}</Text_1.default>
                    <Text_1.default style={[styles.textLabelSupporting, styles.mb2]}>{translate('subscription.yourPlan.saveWithExpensifyDescription')}</Text_1.default>
                </react_native_1.View>
                <SaveWithExpensifyButton_1.default />
            </react_native_1.View>
            <ComparePlansModal_1.default isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}/>
        </Section_1.default>);
}
SubscriptionPlan.displayName = 'SubscriptionPlan';
exports.default = SubscriptionPlan;

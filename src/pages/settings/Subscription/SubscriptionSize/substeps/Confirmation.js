"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var utils_1 = require("@pages/settings/Subscription/utils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SubscriptionSizeForm_1 = require("@src/types/form/SubscriptionSizeForm");
function Confirmation(_a) {
    var _b, _c, _d, _e;
    var onNext = _a.onNext, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT)[0];
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION)[0];
    var subscriptionSizeFormDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SUBSCRIPTION_SIZE_FORM_DRAFT)[0];
    var subscriptionRenewalDate = (0, utils_1.getNewSubscriptionRenewalDate)();
    var subscriptionSizeDraft = subscriptionSizeFormDraft ? Number(subscriptionSizeFormDraft[SubscriptionSizeForm_1.default.SUBSCRIPTION_SIZE]) : 0;
    var subscriptionSize = subscriptionSizeDraft || ((_b = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount) !== null && _b !== void 0 ? _b : 0);
    var isTryingToIncreaseSubscriptionSize = subscriptionSizeDraft > ((_c = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount) !== null && _c !== void 0 ? _c : 0);
    var canChangeSubscriptionSize = ((_d = account === null || account === void 0 ? void 0 : account.canDowngrade) !== null && _d !== void 0 ? _d : false) || (isTryingToIncreaseSubscriptionSize && isEditing);
    var formattedSubscriptionEndDate = (0, utils_1.formatSubscriptionEndDate)(privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.endDate);
    var onClosePress = function () {
        Navigation_1.default.goBack();
    };
    return (<react_native_1.View style={[styles.flexGrow1]}>
            {canChangeSubscriptionSize ? (<>
                    <Text_1.default style={[styles.ph5, styles.pb3]}>{translate('subscription.subscriptionSize.confirmDetails')}</Text_1.default>
                    <MenuItemWithTopDescription_1.default interactive={false} description={translate('subscription.subscriptionSize.subscriptionSize')} title={translate('subscription.subscriptionSize.activeMembers', { size: subscriptionSize })}/>
                    <MenuItemWithTopDescription_1.default interactive={false} description={translate('subscription.subscriptionSize.subscriptionRenews')} title={subscriptionRenewalDate}/>
                </>) : (<>
                    <Text_1.default style={[styles.ph5, styles.pb5, styles.textNormalThemeText]}>{translate('subscription.subscriptionSize.youCantDowngrade')}</Text_1.default>
                    <Text_1.default style={[styles.ph5, styles.textNormalThemeText]}>
                        {translate('subscription.subscriptionSize.youAlreadyCommitted', {
                size: (_e = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount) !== null && _e !== void 0 ? _e : 0,
                date: formattedSubscriptionEndDate,
            })}
                    </Text_1.default>
                </>)}
            <FixedFooter_1.default style={[styles.mtAuto]}>
                {canChangeSubscriptionSize ? (<Button_1.default success large onPress={onNext} text={translate('common.save')}/>) : (<Button_1.default success large onPress={onClosePress} text={translate('common.close')}/>)}
            </FixedFooter_1.default>
        </react_native_1.View>);
}
Confirmation.displayName = 'ConfirmationStep';
exports.default = Confirmation;

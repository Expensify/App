"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubStep_1 = require("@hooks/useSubStep");
var FormActions_1 = require("@libs/actions/FormActions");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Subscription_1 = require("@userActions/Subscription");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SubscriptionSizeForm_1 = require("@src/types/form/SubscriptionSizeForm");
var Confirmation_1 = require("./substeps/Confirmation");
var Size_1 = require("./substeps/Size");
var bodyContent = [Size_1.default, Confirmation_1.default];
function SubscriptionSizePage(_a) {
    var _b, _c;
    var route = _a.route;
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION, { canBeMissing: false })[0];
    var subscriptionSizeFormDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SUBSCRIPTION_SIZE_FORM_DRAFT, { canBeMissing: false })[0];
    var translate = (0, useLocalize_1.default)().translate;
    var canChangeSubscriptionSize = !!((_c = (_b = route.params) === null || _b === void 0 ? void 0 : _b.canChangeSize) !== null && _c !== void 0 ? _c : 1);
    var startFrom = canChangeSubscriptionSize ? 0 : 1;
    var onFinished = function () {
        var _a;
        (0, Subscription_1.updateSubscriptionSize)(subscriptionSizeFormDraft ? Number(subscriptionSizeFormDraft[SubscriptionSizeForm_1.default.SUBSCRIPTION_SIZE]) : 0, (_a = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount) !== null && _a !== void 0 ? _a : 0);
        Navigation_1.default.goBack();
    };
    var _d = (0, useSubStep_1.default)({ bodyContent: bodyContent, startFrom: startFrom, onFinished: onFinished }), SubStep = _d.componentToRender, screenIndex = _d.screenIndex, nextScreen = _d.nextScreen, prevScreen = _d.prevScreen, moveTo = _d.moveTo;
    var onBackButtonPress = function () {
        if (screenIndex !== 0 && startFrom === 0) {
            prevScreen();
            return;
        }
        Navigation_1.default.goBack();
    };
    (0, react_1.useEffect)(function () { return function () {
        (0, FormActions_1.clearDraftValues)(ONYXKEYS_1.default.FORMS.SUBSCRIPTION_SIZE_FORM);
    }; }, []);
    return (<ScreenWrapper_1.default testID={SubscriptionSizePage.displayName} includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight shouldShowOfflineIndicatorInWideScreen>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={translate('subscription.subscriptionSize.title')} onBackButtonPress={onBackButtonPress}/>
                <SubStep isEditing={canChangeSubscriptionSize} onNext={nextScreen} onMove={moveTo}/>
            </DelegateNoAccessWrapper_1.default>
        </ScreenWrapper_1.default>);
}
SubscriptionSizePage.displayName = 'SubscriptionSizePage';
exports.default = SubscriptionSizePage;

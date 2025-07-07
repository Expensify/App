"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Wallet = require("@userActions/Wallet");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ActivateStep_1 = require("./ActivateStep");
var AdditionalDetailsStep_1 = require("./AdditionalDetailsStep");
var FailedKYC_1 = require("./FailedKYC");
// Steps
var OnfidoStep_1 = require("./OnfidoStep");
var TermsStep_1 = require("./TermsStep");
function EnablePaymentsPage(_a) {
    var userWallet = _a.userWallet;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _b = userWallet !== null && userWallet !== void 0 ? userWallet : {}, isPendingOnfidoResult = _b.isPendingOnfidoResult, hasFailedOnfido = _b.hasFailedOnfido;
    (0, react_1.useEffect)(function () {
        if (isOffline) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isPendingOnfidoResult || hasFailedOnfido) {
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_WALLET, { forceReplace: true });
            return;
        }
        Wallet.openEnablePaymentsPage();
    }, [isOffline, isPendingOnfidoResult, hasFailedOnfido]);
    if ((0, EmptyObject_1.isEmptyObject)(userWallet)) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<ScreenWrapper_1.default shouldShowOfflineIndicator={(userWallet === null || userWallet === void 0 ? void 0 : userWallet.currentStep) !== CONST_1.default.WALLET.STEP.ONFIDO} includeSafeAreaPaddingBottom testID={EnablePaymentsPage.displayName}>
            {function () {
            if ((userWallet === null || userWallet === void 0 ? void 0 : userWallet.errorCode) === CONST_1.default.WALLET.ERROR.KYC) {
                return (<>
                            <HeaderWithBackButton_1.default title={translate('additionalDetailsStep.headerTitle')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_WALLET); }}/>
                            <FailedKYC_1.default />
                        </>);
            }
            var currentStep = (userWallet === null || userWallet === void 0 ? void 0 : userWallet.currentStep) || CONST_1.default.WALLET.STEP.ADDITIONAL_DETAILS;
            switch (currentStep) {
                case CONST_1.default.WALLET.STEP.ADDITIONAL_DETAILS:
                case CONST_1.default.WALLET.STEP.ADDITIONAL_DETAILS_KBA:
                    return <AdditionalDetailsStep_1.default />;
                case CONST_1.default.WALLET.STEP.ONFIDO:
                    return <OnfidoStep_1.default />;
                case CONST_1.default.WALLET.STEP.TERMS:
                    return <TermsStep_1.default userWallet={userWallet}/>;
                case CONST_1.default.WALLET.STEP.ACTIVATE:
                    return <ActivateStep_1.default userWallet={userWallet}/>;
                default:
                    return null;
            }
        }}
        </ScreenWrapper_1.default>);
}
EnablePaymentsPage.displayName = 'EnablePaymentsPage';
exports.default = (0, react_native_onyx_1.withOnyx)({
    userWallet: {
        key: ONYXKEYS_1.default.USER_WALLET,
        // We want to refresh the wallet each time the user attempts to activate the wallet so we won't use the
        // stored values here.
        initWithStoredValues: false,
    },
})(EnablePaymentsPage);

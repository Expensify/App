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
exports.onServerDataReady = onServerDataReady;
exports.isOnboardingFlowCompleted = isOnboardingFlowCompleted;
exports.dismissProductTraining = dismissProductTraining;
exports.setOnboardingPurposeSelected = setOnboardingPurposeSelected;
exports.updateOnboardingLastVisitedPath = updateOnboardingLastVisitedPath;
exports.resetAllChecks = resetAllChecks;
exports.setOnboardingAdminsChatReportID = setOnboardingAdminsChatReportID;
exports.setOnboardingPolicyID = setOnboardingPolicyID;
exports.completeHybridAppOnboarding = completeHybridAppOnboarding;
exports.setOnboardingErrorMessage = setOnboardingErrorMessage;
exports.setOnboardingCompanySize = setOnboardingCompanySize;
exports.setSelfTourViewed = setSelfTourViewed;
exports.setOnboardingMergeAccountStepValue = setOnboardingMergeAccountStepValue;
exports.updateOnboardingValuesAndNavigation = updateOnboardingValuesAndNavigation;
var react_native_hybrid_app_1 = require("@expensify/react-native-hybrid-app");
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var DateUtils_1 = require("@libs/DateUtils");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONFIG_1 = require("@src/CONFIG");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var OnboardingFlow_1 = require("./OnboardingFlow");
var isLoadingReportData = true;
var tryNewDotData;
var onboarding;
var resolveIsReadyPromise;
var isServerDataReadyPromise = new Promise(function (resolve) {
    resolveIsReadyPromise = resolve;
});
var resolveOnboardingFlowStatus;
var isOnboardingFlowStatusKnownPromise = new Promise(function (resolve) {
    resolveOnboardingFlowStatus = resolve;
});
var resolveTryNewDotStatus;
function onServerDataReady() {
    return isServerDataReadyPromise;
}
var isOnboardingInProgress = false;
function isOnboardingFlowCompleted(_a) {
    var onCompleted = _a.onCompleted, onNotCompleted = _a.onNotCompleted, onCanceled = _a.onCanceled;
    isOnboardingFlowStatusKnownPromise.then(function () {
        if ((0, EmptyObject_1.isEmptyObject)(onboarding) || (onboarding === null || onboarding === void 0 ? void 0 : onboarding.hasCompletedGuidedSetupFlow) === undefined) {
            onCanceled === null || onCanceled === void 0 ? void 0 : onCanceled();
            return;
        }
        if (onboarding === null || onboarding === void 0 ? void 0 : onboarding.hasCompletedGuidedSetupFlow) {
            isOnboardingInProgress = false;
            onCompleted === null || onCompleted === void 0 ? void 0 : onCompleted();
        }
        else if (!isOnboardingInProgress) {
            isOnboardingInProgress = true;
            onNotCompleted === null || onNotCompleted === void 0 ? void 0 : onNotCompleted();
        }
    });
}
/**
 * Check if report data are loaded
 */
function checkServerDataReady() {
    if (isLoadingReportData) {
        return;
    }
    resolveIsReadyPromise === null || resolveIsReadyPromise === void 0 ? void 0 : resolveIsReadyPromise();
}
/**
 * Check if user completed HybridApp onboarding
 */
function checkTryNewDotDataReady() {
    if (tryNewDotData === undefined) {
        return;
    }
    resolveTryNewDotStatus === null || resolveTryNewDotStatus === void 0 ? void 0 : resolveTryNewDotStatus();
}
/**
 * Check if the onboarding data is loaded
 */
function checkOnboardingDataReady() {
    if (onboarding === undefined) {
        return;
    }
    resolveOnboardingFlowStatus();
}
function setOnboardingPurposeSelected(value) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.ONBOARDING_PURPOSE_SELECTED, value !== null && value !== void 0 ? value : null);
}
function setOnboardingCompanySize(value) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.ONBOARDING_COMPANY_SIZE, value);
}
function setOnboardingErrorMessage(value) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.ONBOARDING_ERROR_MESSAGE, value !== null && value !== void 0 ? value : null);
}
function setOnboardingAdminsChatReportID(adminsChatReportID) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.ONBOARDING_ADMINS_CHAT_REPORT_ID, adminsChatReportID !== null && adminsChatReportID !== void 0 ? adminsChatReportID : null);
}
function setOnboardingPolicyID(policyID) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.ONBOARDING_POLICY_ID, policyID !== null && policyID !== void 0 ? policyID : null);
}
function updateOnboardingLastVisitedPath(path) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ONBOARDING_LAST_VISITED_PATH, path);
}
function updateOnboardingValuesAndNavigation(onboardingValues) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_ONBOARDING, __assign(__assign({}, onboardingValues), { shouldValidate: undefined }));
    // We need to have the Onyx values updated before navigating back
    // Because we navigate based no useEffect logic and we need to clear `shouldValidate` value before going back
    Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
        Navigation_1.default.goBack(ROUTES_1.default.ONBOARDING_WORK_EMAIL.getRoute());
    });
}
function setOnboardingMergeAccountStepValue(value, skipped) {
    if (skipped === void 0) { skipped = false; }
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { isMergeAccountStepCompleted: value, isMergeAccountStepSkipped: skipped });
}
function completeHybridAppOnboarding() {
    if (!CONFIG_1.default.IS_HYBRID_APP) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_TRY_NEW_DOT,
            value: {
                classicRedirect: {
                    completedHybridAppOnboarding: true,
                },
            },
        },
    ];
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.COMPLETE_HYBRID_APP_ONBOARDING, {}, { optimisticData: optimisticData }).then(function (response) {
        if (!response) {
            return;
        }
        // No matter what the response is, we want to mark the onboarding as completed (user saw the explanation modal)
        Log_1.default.info("[HybridApp] Onboarding status has changed. Propagating new value to OldDot", true);
        react_native_hybrid_app_1.default.completeOnboarding({ status: true });
    });
}
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_ONBOARDING,
    callback: function (value) {
        onboarding = value;
        checkOnboardingDataReady();
    },
});
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.IS_LOADING_REPORT_DATA,
    initWithStoredValues: false,
    callback: function (value) {
        isLoadingReportData = value !== null && value !== void 0 ? value : false;
        checkServerDataReady();
    },
});
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_TRY_NEW_DOT,
    callback: function (value) {
        tryNewDotData = value;
        checkTryNewDotDataReady();
    },
});
function resetAllChecks() {
    isServerDataReadyPromise = new Promise(function (resolve) {
        resolveIsReadyPromise = resolve;
    });
    isOnboardingFlowStatusKnownPromise = new Promise(function (resolve) {
        resolveOnboardingFlowStatus = resolve;
    });
    isLoadingReportData = true;
    isOnboardingInProgress = false;
    (0, OnboardingFlow_1.clearInitialPath)();
}
function setSelfTourViewed(shouldUpdateOnyxDataOnlyLocally) {
    if (shouldUpdateOnyxDataOnlyLocally === void 0) { shouldUpdateOnyxDataOnlyLocally = false; }
    if (shouldUpdateOnyxDataOnlyLocally) {
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { selfTourViewed: true });
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_ONBOARDING,
            value: {
                selfTourViewed: true,
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.SELF_TOUR_VIEWED, null, { optimisticData: optimisticData });
}
function dismissProductTraining(elementName, isDismissedUsingCloseButton) {
    var _a;
    if (isDismissedUsingCloseButton === void 0) { isDismissedUsingCloseButton = false; }
    var date = new Date();
    var dismissedMethod = isDismissedUsingCloseButton ? 'x' : 'click';
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING,
            value: (_a = {},
                _a[elementName] = {
                    timestamp: DateUtils_1.default.getDBTime(date.valueOf()),
                    dismissedMethod: dismissedMethod,
                },
                _a),
        },
    ];
    API.write(types_1.WRITE_COMMANDS.DISMISS_PRODUCT_TRAINING, { name: elementName, dismissedMethod: dismissedMethod }, { optimisticData: optimisticData });
}

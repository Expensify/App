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
var core_1 = require("@react-navigation/core");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_blob_util_1 = require("react-native-blob-util");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_permissions_1 = require("react-native-permissions");
var react_native_reanimated_1 = require("react-native-reanimated");
var react_native_vision_camera_1 = require("react-native-vision-camera");
var educational_illustration__multi_scan_svg_1 = require("@assets/images/educational-illustration__multi-scan.svg");
var fake_receipt_png_1 = require("@assets/images/fake-receipt.png");
var hand_svg_1 = require("@assets/images/hand.svg");
var shutter_svg_1 = require("@assets/images/shutter.svg");
var AttachmentPicker_1 = require("@components/AttachmentPicker");
var Button_1 = require("@components/Button");
var FeatureTrainingModal_1 = require("@components/FeatureTrainingModal");
var FullScreenLoaderContext_1 = require("@components/FullScreenLoaderContext");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var ImageSVG_1 = require("@components/ImageSVG");
var LocationPermissionModal_1 = require("@components/LocationPermissionModal");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Text_1 = require("@components/Text");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useFilesValidation_1 = require("@hooks/useFilesValidation");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var usePolicy_1 = require("@hooks/usePolicy");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var setTestReceipt_1 = require("@libs/actions/setTestReceipt");
var Welcome_1 = require("@libs/actions/Welcome");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var getPhotoSource_1 = require("@libs/fileDownload/getPhotoSource");
var getCurrentPosition_1 = require("@libs/getCurrentPosition");
var getPlatform_1 = require("@libs/getPlatform");
var getReceiptsUploadFolderPath_1 = require("@libs/getReceiptsUploadFolderPath");
var HapticFeedback_1 = require("@libs/HapticFeedback");
var IOUUtils_1 = require("@libs/IOUUtils");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var StepScreenWrapper_1 = require("@pages/iou/request/step/StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("@pages/iou/request/step/withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("@pages/iou/request/step/withWritableReportOrNotFound");
var IOU_1 = require("@userActions/IOU");
var TransactionEdit_1 = require("@userActions/TransactionEdit");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var CameraPermission_1 = require("./CameraPermission");
var Camera_1 = require("./NavigationAwareCamera/Camera");
var ReceiptPreviews_1 = require("./ReceiptPreviews");
function IOURequestStepScan(_a) {
    var _b, _c, _d;
    var report = _a.report, _e = _a.route.params, action = _e.action, iouType = _e.iouType, reportID = _e.reportID, initialTransactionID = _e.transactionID, backTo = _e.backTo, backToReport = _e.backToReport, initialTransaction = _a.transaction, currentUserPersonalDetails = _a.currentUserPersonalDetails, onLayout = _a.onLayout, _f = _a.isMultiScanEnabled, isMultiScanEnabled = _f === void 0 ? false : _f, setIsMultiScanEnabled = _a.setIsMultiScanEnabled;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _g = (0, FullScreenLoaderContext_1.useFullScreenLoader)(), isLoaderVisible = _g.isLoaderVisible, setIsLoaderVisible = _g.setIsLoaderVisible;
    var device = (0, react_native_vision_camera_1.useCameraDevice)('back', {
        physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera'],
    });
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    var hasFlash = !!(device === null || device === void 0 ? void 0 : device.hasFlash);
    var camera = (0, react_1.useRef)(null);
    var _h = (0, react_1.useState)(false), flash = _h[0], setFlash = _h[1];
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var canUseMultiScan = isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MULTI_SCAN) && !isEditing && iouType !== CONST_1.default.IOU.TYPE.SPLIT && !backTo && !backToReport;
    var _j = (0, react_1.useState)(false), startLocationPermissionFlow = _j[0], setStartLocationPermissionFlow = _j[1];
    var _k = (0, react_1.useState)([]), receiptFiles = _k[0], setReceiptFiles = _k[1];
    var reportNameValuePairs = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report === null || report === void 0 ? void 0 : report.reportID), { canBeMissing: true })[0];
    var policy = (0, usePolicy_1.default)(report === null || report === void 0 ? void 0 : report.policyID);
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var skipConfirmation = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SKIP_CONFIRMATION).concat(initialTransactionID), { canBeMissing: true })[0];
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: false })[0];
    var activePolicy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(activePolicyID), { canBeMissing: true })[0];
    var dismissedProductTraining = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING, { canBeMissing: true })[0];
    var platform = (0, getPlatform_1.default)(true);
    var _l = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_MUTED_PLATFORMS, { canBeMissing: true })[0], mutedPlatforms = _l === void 0 ? {} : _l;
    var isPlatformMuted = mutedPlatforms[platform];
    var _m = (0, react_1.useState)(null), cameraPermissionStatus = _m[0], setCameraPermissionStatus = _m[1];
    var _o = (0, react_1.useState)(false), didCapturePhoto = _o[0], setDidCapturePhoto = _o[1];
    var _p = (0, react_1.useState)(false), shouldShowMultiScanEducationalPopup = _p[0], setShouldShowMultiScanEducationalPopup = _p[1];
    var _q = (0, react_1.useState)(0), cameraKey = _q[0], setCameraKey = _q[1];
    var defaultTaxCode = (0, TransactionUtils_1.getDefaultTaxCode)(policy, initialTransaction);
    var transactionTaxCode = (_b = ((initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.taxCode) ? initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.taxCode : defaultTaxCode)) !== null && _b !== void 0 ? _b : '';
    var transactionTaxAmount = (_c = initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.taxAmount) !== null && _c !== void 0 ? _c : 0;
    var optimisticTransactions = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT, {
        selector: function (items) { return Object.values(items !== null && items !== void 0 ? items : {}); },
        canBeMissing: true,
    })[0];
    var transactions = (0, react_1.useMemo)(function () {
        var allTransactions = initialTransactionID === CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID ? (optimisticTransactions !== null && optimisticTransactions !== void 0 ? optimisticTransactions : []) : [initialTransaction];
        return allTransactions.filter(function (transaction) { return !!transaction; });
    }, [initialTransaction, initialTransactionID, optimisticTransactions]);
    var blinkOpacity = (0, react_native_reanimated_1.useSharedValue)(0);
    var blinkStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        opacity: blinkOpacity.get(),
    }); });
    var showBlink = (0, react_1.useCallback)(function () {
        blinkOpacity.set((0, react_native_reanimated_1.withTiming)(0.4, { duration: 10 }, function () {
            blinkOpacity.set((0, react_native_reanimated_1.withTiming)(0, { duration: 50 }));
        }));
        HapticFeedback_1.default.press();
    }, [blinkOpacity]);
    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    var shouldSkipConfirmation = (0, react_1.useMemo)(function () {
        var _a, _b;
        if (!skipConfirmation || !(report === null || report === void 0 ? void 0 : report.reportID)) {
            return false;
        }
        return !(0, ReportUtils_1.isArchivedReport)(reportNameValuePairs) && !((0, ReportUtils_1.isPolicyExpenseChat)(report) && (((_a = policy === null || policy === void 0 ? void 0 : policy.requiresCategory) !== null && _a !== void 0 ? _a : false) || ((_b = policy === null || policy === void 0 ? void 0 : policy.requiresTag) !== null && _b !== void 0 ? _b : false)));
    }, [report, skipConfirmation, policy, reportNameValuePairs]);
    var translate = (0, useLocalize_1.default)().translate;
    var askForPermissions = function () {
        var _a;
        // There's no way we can check for the BLOCKED status without requesting the permission first
        // https://github.com/zoontek/react-native-permissions/blob/a836e114ce3a180b2b23916292c79841a267d828/README.md?plain=1#L670
        (_a = CameraPermission_1.default.requestCameraPermission) === null || _a === void 0 ? void 0 : _a.call(CameraPermission_1.default).then(function (status) {
            setCameraPermissionStatus(status);
            if (status === react_native_permissions_1.RESULTS.BLOCKED) {
                (0, FileUtils_1.showCameraPermissionsAlert)();
            }
        }).catch(function () {
            setCameraPermissionStatus(react_native_permissions_1.RESULTS.UNAVAILABLE);
        });
    };
    var focusIndicatorOpacity = (0, react_native_reanimated_1.useSharedValue)(0);
    var focusIndicatorScale = (0, react_native_reanimated_1.useSharedValue)(2);
    var focusIndicatorPosition = (0, react_native_reanimated_1.useSharedValue)({ x: 0, y: 0 });
    var cameraFocusIndicatorAnimatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        opacity: focusIndicatorOpacity.get(),
        transform: [{ translateX: focusIndicatorPosition.get().x }, { translateY: focusIndicatorPosition.get().y }, { scale: focusIndicatorScale.get() }],
    }); });
    var focusCamera = function (point) {
        if (!camera.current) {
            return;
        }
        camera.current.focus(point).catch(function (error) {
            if (error.message === '[unknown/unknown] Cancelled by another startFocusAndMetering()') {
                return;
            }
            Log_1.default.warn('Error focusing camera', error);
        });
    };
    var tapGesture = react_native_gesture_handler_1.Gesture.Tap()
        .enabled((_d = device === null || device === void 0 ? void 0 : device.supportsFocus) !== null && _d !== void 0 ? _d : false)
        // eslint-disable-next-line react-compiler/react-compiler
        .onStart(function (ev) {
        var point = { x: ev.x, y: ev.y };
        focusIndicatorOpacity.set((0, react_native_reanimated_1.withSequence)((0, react_native_reanimated_1.withTiming)(0.8, { duration: 250 }), (0, react_native_reanimated_1.withDelay)(1000, (0, react_native_reanimated_1.withTiming)(0, { duration: 250 }))));
        focusIndicatorScale.set(2);
        focusIndicatorScale.set((0, react_native_reanimated_1.withSpring)(1, { damping: 10, stiffness: 200 }));
        focusIndicatorPosition.set(point);
        (0, react_native_reanimated_1.runOnJS)(focusCamera)(point);
    });
    (0, core_1.useFocusEffect)((0, react_1.useCallback)(function () {
        setDidCapturePhoto(false);
        var refreshCameraPermissionStatus = function () {
            var _a;
            (_a = CameraPermission_1.default === null || CameraPermission_1.default === void 0 ? void 0 : CameraPermission_1.default.getCameraPermissionStatus) === null || _a === void 0 ? void 0 : _a.call(CameraPermission_1.default).then(setCameraPermissionStatus).catch(function () { return setCameraPermissionStatus(react_native_permissions_1.RESULTS.UNAVAILABLE); });
        };
        react_native_1.InteractionManager.runAfterInteractions(function () {
            // Check initial camera permission status
            refreshCameraPermissionStatus();
        });
        // Refresh permission status when app gain focus
        var subscription = react_native_1.AppState.addEventListener('change', function (appState) {
            if (appState !== 'active') {
                return;
            }
            setCameraKey(function (prev) { return prev + 1; });
            refreshCameraPermissionStatus();
        });
        return function () {
            subscription.remove();
            if (isLoaderVisible) {
                setIsLoaderVisible(false);
            }
        };
    }, [isLoaderVisible, setIsLoaderVisible]));
    (0, react_1.useEffect)(function () {
        if (isMultiScanEnabled) {
            return;
        }
        setReceiptFiles([]);
    }, [isMultiScanEnabled]);
    var navigateBack = function () {
        Navigation_1.default.goBack();
    };
    var navigateToConfirmationPage = (0, react_1.useCallback)(function (isTestTransaction, reportIDParam) {
        if (isTestTransaction === void 0) { isTestTransaction = false; }
        if (reportIDParam === void 0) { reportIDParam = undefined; }
        switch (iouType) {
            case CONST_1.default.IOU.TYPE.REQUEST:
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.SUBMIT, initialTransactionID, reportID, backToReport));
                break;
            case CONST_1.default.IOU.TYPE.SEND:
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.PAY, initialTransactionID, reportID));
                break;
            default:
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, isTestTransaction ? CONST_1.default.IOU.TYPE.SUBMIT : iouType, initialTransactionID, 
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                reportIDParam || reportID, backToReport));
        }
    }, [backToReport, iouType, reportID, initialTransactionID]);
    var createTransaction = (0, react_1.useCallback)(function (files, participant, gpsPoints, policyParams, billable) {
        files.forEach(function (receiptFile, index) {
            var _a, _b, _c, _d, _e;
            var transaction = transactions.find(function (item) { return item.transactionID === receiptFile.transactionID; });
            var receipt = (_a = receiptFile.file) !== null && _a !== void 0 ? _a : {};
            receipt.source = receiptFile.source;
            receipt.state = CONST_1.default.IOU.RECEIPT_STATE.SCAN_READY;
            if (iouType === CONST_1.default.IOU.TYPE.TRACK && report) {
                (0, IOU_1.trackExpense)(__assign(__assign({ report: report, isDraftPolicy: false, participantParams: {
                        payeeEmail: currentUserPersonalDetails.login,
                        payeeAccountID: currentUserPersonalDetails.accountID,
                        participant: participant,
                    }, transactionParams: __assign({ amount: 0, currency: (_b = transaction === null || transaction === void 0 ? void 0 : transaction.currency) !== null && _b !== void 0 ? _b : 'USD', created: transaction === null || transaction === void 0 ? void 0 : transaction.created, receipt: receipt, billable: billable }, (gpsPoints !== null && gpsPoints !== void 0 ? gpsPoints : {})) }, (policyParams !== null && policyParams !== void 0 ? policyParams : {})), { shouldHandleNavigation: index === files.length - 1 }));
            }
            else {
                (0, IOU_1.requestMoney)(__assign(__assign(__assign({ report: report, participantParams: {
                        payeeEmail: currentUserPersonalDetails.login,
                        payeeAccountID: currentUserPersonalDetails.accountID,
                        participant: participant,
                    } }, (policyParams !== null && policyParams !== void 0 ? policyParams : {})), (gpsPoints !== null && gpsPoints !== void 0 ? gpsPoints : {})), { transactionParams: {
                        amount: 0,
                        attendees: (_c = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _c === void 0 ? void 0 : _c.attendees,
                        currency: (_d = transaction === null || transaction === void 0 ? void 0 : transaction.currency) !== null && _d !== void 0 ? _d : 'USD',
                        created: (_e = transaction === null || transaction === void 0 ? void 0 : transaction.created) !== null && _e !== void 0 ? _e : '',
                        merchant: '',
                        receipt: receipt,
                        billable: billable,
                    }, shouldHandleNavigation: index === files.length - 1, backToReport: backToReport }));
            }
        });
    }, [backToReport, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login, iouType, report, transactions]);
    var navigateToConfirmationStep = (0, react_1.useCallback)(function (files, locationPermissionGranted, isTestTransaction) {
        var _a, _b, _c, _d;
        if (locationPermissionGranted === void 0) { locationPermissionGranted = false; }
        if (isTestTransaction === void 0) { isTestTransaction = false; }
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        if (isTestTransaction) {
            var managerMcTestParticipant = (_a = (0, OptionsListUtils_1.getManagerMcTestParticipant)()) !== null && _a !== void 0 ? _a : {};
            var reportIDParam_1 = managerMcTestParticipant.reportID;
            if (!managerMcTestParticipant.reportID && (report === null || report === void 0 ? void 0 : report.reportID)) {
                reportIDParam_1 = (0, ReportUtils_1.generateReportID)();
            }
            (0, IOU_1.setMoneyRequestParticipants)(initialTransactionID, [
                __assign(__assign({}, managerMcTestParticipant), { reportID: reportIDParam_1, selected: true }),
            ], true).then(function () {
                navigateToConfirmationPage(true, reportIDParam_1);
            });
            return;
        }
        // If a reportID exists in the report object, it's because either:
        // - The user started this flow from using the + button in the composer inside a report.
        // - The user started this flow from using the global create menu by selecting the Track expense option.
        // In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        // If the user is started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
        if ((report === null || report === void 0 ? void 0 : report.reportID) && !(0, ReportUtils_1.isArchivedReport)(reportNameValuePairs) && iouType !== CONST_1.default.IOU.TYPE.CREATE) {
            var selectedParticipants = (0, IOU_1.getMoneyRequestParticipantsFromReport)(report);
            var participants = selectedParticipants.map(function (participant) {
                var _a;
                var participantAccountID = (_a = participant === null || participant === void 0 ? void 0 : participant.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
                return participantAccountID ? (0, OptionsListUtils_1.getParticipantsOption)(participant, personalDetails) : (0, OptionsListUtils_1.getReportOption)(participant);
            });
            if (shouldSkipConfirmation) {
                var firstReceiptFile = files.at(0);
                if (iouType === CONST_1.default.IOU.TYPE.SPLIT && firstReceiptFile) {
                    var splitReceipt = (_b = firstReceiptFile.file) !== null && _b !== void 0 ? _b : {};
                    splitReceipt.source = firstReceiptFile.source;
                    splitReceipt.state = CONST_1.default.IOU.RECEIPT_STATE.SCAN_READY;
                    (0, IOU_1.startSplitBill)({
                        participants: participants,
                        currentUserLogin: (_c = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.login) !== null && _c !== void 0 ? _c : '',
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        comment: '',
                        receipt: splitReceipt,
                        existingSplitChatReportID: reportID,
                        billable: false,
                        category: '',
                        tag: '',
                        currency: (_d = initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.currency) !== null && _d !== void 0 ? _d : 'USD',
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                    });
                    return;
                }
                var participant_1 = participants.at(0);
                if (!participant_1) {
                    return;
                }
                if (locationPermissionGranted) {
                    (0, getCurrentPosition_1.default)(function (successData) {
                        var policyParams = { policy: policy };
                        var gpsPoints = {
                            lat: successData.coords.latitude,
                            long: successData.coords.longitude,
                        };
                        createTransaction(files, participant_1, gpsPoints, policyParams, false);
                    }, function (errorData) {
                        Log_1.default.info('[IOURequestStepScan] getCurrentPosition failed', false, errorData);
                        // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                        createTransaction(files, participant_1);
                    }, {
                        maximumAge: CONST_1.default.GPS.MAX_AGE,
                        timeout: CONST_1.default.GPS.TIMEOUT,
                    });
                    return;
                }
                createTransaction(files, participant_1);
                return;
            }
            var setParticipantsPromises = files.map(function (receiptFile) { return (0, IOU_1.setMoneyRequestParticipantsFromReport)(receiptFile.transactionID, report); });
            Promise.all(setParticipantsPromises).then(function () { return navigateToConfirmationPage(); });
            return;
        }
        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
        if (iouType === CONST_1.default.IOU.TYPE.CREATE && (0, PolicyUtils_1.isPaidGroupPolicy)(activePolicy) && (activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.isPolicyExpenseChatEnabled) && !(0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(activePolicy.id)) {
            var activePolicyExpenseChat_1 = (0, ReportUtils_1.getPolicyExpenseChat)(currentUserPersonalDetails.accountID, activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.id);
            var setParticipantsPromises = files.map(function (receiptFile) { return (0, IOU_1.setMoneyRequestParticipantsFromReport)(receiptFile.transactionID, activePolicyExpenseChat_1); });
            Promise.all(setParticipantsPromises).then(function () {
                return Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType === CONST_1.default.IOU.TYPE.CREATE ? CONST_1.default.IOU.TYPE.SUBMIT : iouType, initialTransactionID, activePolicyExpenseChat_1 === null || activePolicyExpenseChat_1 === void 0 ? void 0 : activePolicyExpenseChat_1.reportID));
            });
        }
        else {
            (0, IOUUtils_1.navigateToParticipantPage)(iouType, initialTransactionID, reportID);
        }
    }, [
        backTo,
        report,
        reportNameValuePairs,
        iouType,
        activePolicy,
        initialTransactionID,
        navigateToConfirmationPage,
        shouldSkipConfirmation,
        personalDetails,
        createTransaction,
        currentUserPersonalDetails.login,
        currentUserPersonalDetails.accountID,
        reportID,
        initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.currency,
        transactionTaxCode,
        transactionTaxAmount,
        policy,
    ]);
    var updateScanAndNavigate = (0, react_1.useCallback)(function (file, source) {
        navigateBack();
        (0, IOU_1.replaceReceipt)({ transactionID: initialTransactionID, file: file, source: source });
    }, [initialTransactionID]);
    /**
     * Sets a test receipt from CONST.TEST_RECEIPT_URL and navigates to the confirmation step
     */
    var setTestReceiptAndNavigate = (0, react_1.useCallback)(function () {
        (0, setTestReceipt_1.default)(fake_receipt_png_1.default, 'png', function (source, file, filename) {
            if (!file.uri) {
                return;
            }
            (0, IOU_1.setMoneyRequestReceipt)(initialTransactionID, source, filename, !isEditing, file.type, true);
            navigateToConfirmationStep([{ file: file, source: file.uri, transactionID: initialTransactionID }], false, true);
        });
    }, [initialTransactionID, isEditing, navigateToConfirmationStep]);
    var dismissMultiScanEducationalPopup = function () {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            (0, Welcome_1.dismissProductTraining)(CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL);
            setShouldShowMultiScanEducationalPopup(false);
        });
    };
    /**
     * Sets the Receipt objects and navigates the user to the next page
     */
    var setReceiptFilesAndNavigate = function (files) {
        var _a;
        if (files.length === 0) {
            return;
        }
        // Store the receipt on the transaction object in Onyx
        var newReceiptFiles = [];
        if (isEditing) {
            var file = files.at(0);
            if (!file) {
                return;
            }
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (0, IOU_1.setMoneyRequestReceipt)(initialTransactionID, file.uri || '', file.name || '', !isEditing);
            updateScanAndNavigate(file, (_a = file.uri) !== null && _a !== void 0 ? _a : '');
            return;
        }
        files.forEach(function (file, index) {
            var _a, _b, _c;
            var transaction = !isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) || (index === 0 && transactions.length === 1 && !(initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.receipt))
                ? initialTransaction
                : (0, TransactionEdit_1.buildOptimisticTransactionAndCreateDraft)({
                    initialTransaction: initialTransaction,
                    currentUserPersonalDetails: currentUserPersonalDetails,
                    reportID: reportID,
                });
            var transactionID = (_a = transaction.transactionID) !== null && _a !== void 0 ? _a : initialTransactionID;
            newReceiptFiles.push({ file: file, source: (_b = file.uri) !== null && _b !== void 0 ? _b : '', transactionID: transactionID });
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (0, IOU_1.setMoneyRequestReceipt)(transactionID, (_c = file.uri) !== null && _c !== void 0 ? _c : '', file.name || '', true);
        });
        if (shouldSkipConfirmation) {
            setReceiptFiles(newReceiptFiles);
            var gpsRequired = (initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.amount) === 0 && iouType !== CONST_1.default.IOU.TYPE.SPLIT && files.length;
            if (gpsRequired) {
                var beginLocationPermissionFlow = (0, IOUUtils_1.shouldStartLocationPermissionFlow)();
                if (beginLocationPermissionFlow) {
                    setStartLocationPermissionFlow(true);
                    return;
                }
            }
        }
        navigateToConfirmationStep(newReceiptFiles, false);
    };
    var _r = (0, useFilesValidation_1.default)(setReceiptFilesAndNavigate), validateFiles = _r.validateFiles, PDFValidationComponent = _r.PDFValidationComponent, ErrorModal = _r.ErrorModal;
    var submitReceipts = (0, react_1.useCallback)(function (files) {
        if (shouldSkipConfirmation) {
            var gpsRequired = (initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.amount) === 0 && iouType !== CONST_1.default.IOU.TYPE.SPLIT;
            if (gpsRequired) {
                var beginLocationPermissionFlow = (0, IOUUtils_1.shouldStartLocationPermissionFlow)();
                if (beginLocationPermissionFlow) {
                    setStartLocationPermissionFlow(true);
                    return;
                }
            }
        }
        navigateToConfirmationStep(files, false);
    }, [initialTransaction, iouType, navigateToConfirmationStep, shouldSkipConfirmation]);
    var capturePhoto = (0, react_1.useCallback)(function () {
        if (!camera.current && (cameraPermissionStatus === react_native_permissions_1.RESULTS.DENIED || cameraPermissionStatus === react_native_permissions_1.RESULTS.BLOCKED)) {
            askForPermissions();
            return;
        }
        var showCameraAlert = function () {
            react_native_1.Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
        };
        if (!camera.current) {
            showCameraAlert();
        }
        if (didCapturePhoto) {
            return;
        }
        if (isMultiScanEnabled) {
            showBlink();
        }
        setDidCapturePhoto(true);
        var path = (0, getReceiptsUploadFolderPath_1.default)();
        react_native_blob_util_1.default.fs
            .isDir(path)
            .then(function (isDir) {
            if (isDir) {
                return;
            }
            react_native_blob_util_1.default.fs.mkdir(path).catch(function (error) {
                Log_1.default.warn('Error creating the directory', error);
            });
        })
            .catch(function (error) {
            Log_1.default.warn('Error checking if the directory exists', error);
        })
            .then(function () {
            var _a;
            (_a = camera === null || camera === void 0 ? void 0 : camera.current) === null || _a === void 0 ? void 0 : _a.takePhoto({
                flash: flash && hasFlash ? 'on' : 'off',
                enableShutterSound: !isPlatformMuted,
                path: path,
            }).then(function (photo) {
                var _a, _b;
                // Store the receipt on the transaction object in Onyx
                var source = (0, getPhotoSource_1.default)(photo.path);
                var transaction = isMultiScanEnabled && ((_a = initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.receipt) === null || _a === void 0 ? void 0 : _a.source)
                    ? (0, TransactionEdit_1.buildOptimisticTransactionAndCreateDraft)({
                        initialTransaction: initialTransaction,
                        currentUserPersonalDetails: currentUserPersonalDetails,
                        reportID: reportID,
                    })
                    : initialTransaction;
                var transactionID = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) !== null && _b !== void 0 ? _b : initialTransactionID;
                (0, IOU_1.setMoneyRequestReceipt)(transactionID, source, photo.path, !isEditing);
                (0, FileUtils_1.readFileAsync)(source, photo.path, function (file) {
                    if (isEditing) {
                        updateScanAndNavigate(file, source);
                        return;
                    }
                    var newReceiptFiles = __spreadArray(__spreadArray([], receiptFiles, true), [{ file: file, source: source, transactionID: transactionID }], false);
                    setReceiptFiles(newReceiptFiles);
                    if (isMultiScanEnabled) {
                        setDidCapturePhoto(false);
                        return;
                    }
                    submitReceipts(newReceiptFiles);
                }, function () {
                    setDidCapturePhoto(false);
                    showCameraAlert();
                    Log_1.default.warn('Error reading photo');
                });
            }).catch(function (error) {
                setDidCapturePhoto(false);
                showCameraAlert();
                Log_1.default.warn('Error taking photo', error);
            });
        });
    }, [
        cameraPermissionStatus,
        didCapturePhoto,
        isMultiScanEnabled,
        translate,
        showBlink,
        flash,
        hasFlash,
        isPlatformMuted,
        initialTransaction,
        currentUserPersonalDetails,
        reportID,
        initialTransactionID,
        isEditing,
        receiptFiles,
        submitReceipts,
        updateScanAndNavigate,
    ]);
    var toggleMultiScan = function () {
        if (!(dismissedProductTraining === null || dismissedProductTraining === void 0 ? void 0 : dismissedProductTraining[CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL])) {
            setShouldShowMultiScanEducationalPopup(true);
        }
        if (isMultiScanEnabled) {
            (0, TransactionEdit_1.removeDraftTransactions)(true);
        }
        (0, TransactionEdit_1.removeTransactionReceipt)(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID);
        setIsMultiScanEnabled === null || setIsMultiScanEnabled === void 0 ? void 0 : setIsMultiScanEnabled(!isMultiScanEnabled);
    };
    // Wait for camera permission status to render
    if (cameraPermissionStatus == null) {
        return null;
    }
    return (<StepScreenWrapper_1.default includeSafeAreaPaddingBottom headerTitle={translate('common.receipt')} onBackButtonPress={navigateBack} shouldShowWrapper={!!backTo || isEditing} testID={IOURequestStepScan.displayName}>
            <react_native_1.View style={styles.flex1} onLayout={function () {
            if (!onLayout) {
                return;
            }
            onLayout(setTestReceiptAndNavigate);
        }}>
                {PDFValidationComponent}
                <react_native_1.View style={[styles.flex1]}>
                    {cameraPermissionStatus !== react_native_permissions_1.RESULTS.GRANTED && (<react_native_1.View style={[styles.cameraView, styles.permissionView, styles.userSelectNone]}>
                            <ImageSVG_1.default contentFit="contain" src={hand_svg_1.default} width={CONST_1.default.RECEIPT.HAND_ICON_WIDTH} height={CONST_1.default.RECEIPT.HAND_ICON_HEIGHT} style={styles.pb5}/>

                            <Text_1.default style={[styles.textFileUpload]}>{translate('receipt.takePhoto')}</Text_1.default>
                            <Text_1.default style={[styles.subTextFileUpload]}>{translate('receipt.cameraAccess')}</Text_1.default>
                            <Button_1.default success text={translate('common.continue')} accessibilityLabel={translate('common.continue')} style={[styles.p9, styles.pt5]} onPress={capturePhoto}/>
                        </react_native_1.View>)}
                    {cameraPermissionStatus === react_native_permissions_1.RESULTS.GRANTED && device == null && (<react_native_1.View style={[styles.cameraView]}>
                            <react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={[styles.flex1]} color={theme.textSupporting}/>
                        </react_native_1.View>)}
                    {cameraPermissionStatus === react_native_permissions_1.RESULTS.GRANTED && device != null && (<react_native_1.View style={[styles.cameraView]}>
                            <react_native_gesture_handler_1.GestureDetector gesture={tapGesture}>
                                <react_native_1.View style={styles.flex1}>
                                    <Camera_1.default key={cameraKey} ref={camera} device={device} style={styles.flex1} zoom={device.neutralZoom} photo cameraTabIndex={1}/>
                                    <react_native_reanimated_1.default.View style={[styles.cameraFocusIndicator, cameraFocusIndicatorAnimatedStyle]}/>
                                    {canUseMultiScan ? (<react_native_1.View style={[styles.flashButtonContainer, styles.primaryMediumIcon, flash && styles.bgGreenSuccess, !hasFlash && styles.opacity0]}>
                                            <PressableWithFeedback_1.default role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('receipt.flash')} disabled={cameraPermissionStatus !== react_native_permissions_1.RESULTS.GRANTED || !hasFlash} onPress={function () { return setFlash(function (prevFlash) { return !prevFlash; }); }}>
                                                <Icon_1.default height={16} width={16} src={Expensicons.Bolt} fill={flash ? theme.white : theme.icon}/>
                                            </PressableWithFeedback_1.default>
                                        </react_native_1.View>) : null}
                                    <react_native_reanimated_1.default.View pointerEvents="none" style={[react_native_1.StyleSheet.absoluteFillObject, styles.backgroundWhite, blinkStyle, styles.zIndex10]}/>
                                </react_native_1.View>
                            </react_native_gesture_handler_1.GestureDetector>
                        </react_native_1.View>)}
                </react_native_1.View>
                {shouldShowMultiScanEducationalPopup && (<FeatureTrainingModal_1.default title={translate('iou.scanMultipleReceipts')} image={educational_illustration__multi_scan_svg_1.default} shouldRenderSVG imageHeight={220} modalInnerContainerStyle={styles.pt0} illustrationOuterContainerStyle={styles.multiScanEducationalPopupImage} onConfirm={dismissMultiScanEducationalPopup} titleStyles={styles.mb2} confirmText={translate('common.buttonConfirm')} description={translate('iou.scanMultipleReceiptsDescription')} contentInnerContainerStyles={styles.mb6} shouldGoBack={false}/>)}
                <react_native_1.View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                    <AttachmentPicker_1.default onOpenPicker={function () { return setIsLoaderVisible(true); }} fileLimit={isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) ? CONST_1.default.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT : 1}>
                        {function (_a) {
            var openPicker = _a.openPicker;
            return (<PressableWithFeedback_1.default role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('receipt.gallery')} style={[styles.alignItemsStart, isMultiScanEnabled && styles.opacity0]} onPress={function () {
                    openPicker({
                        onPicked: function (data) { return validateFiles(data); },
                        onCanceled: function () { return setIsLoaderVisible(false); },
                        // makes sure the loader is not visible anymore e.g. when there is an error while uploading a file
                        onClosed: function () {
                            setIsLoaderVisible(false);
                        },
                    });
                }}>
                                <Icon_1.default height={32} width={32} src={Expensicons.Gallery} fill={theme.textSupporting}/>
                            </PressableWithFeedback_1.default>);
        }}
                    </AttachmentPicker_1.default>
                    <PressableWithFeedback_1.default role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('receipt.shutter')} style={[styles.alignItemsCenter]} onPress={capturePhoto}>
                        <ImageSVG_1.default contentFit="contain" src={shutter_svg_1.default} width={CONST_1.default.RECEIPT.SHUTTER_SIZE} height={CONST_1.default.RECEIPT.SHUTTER_SIZE}/>
                    </PressableWithFeedback_1.default>
                    {canUseMultiScan ? (<PressableWithFeedback_1.default accessibilityRole="button" role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('receipt.multiScan')} style={styles.alignItemsEnd} onPress={toggleMultiScan}>
                            <Icon_1.default height={32} width={32} src={Expensicons.ReceiptMultiple} fill={isMultiScanEnabled ? theme.iconMenu : theme.textSupporting}/>
                        </PressableWithFeedback_1.default>) : (<PressableWithFeedback_1.default role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('receipt.flash')} style={[styles.alignItemsEnd, !hasFlash && styles.opacity0]} disabled={cameraPermissionStatus !== react_native_permissions_1.RESULTS.GRANTED || !hasFlash} onPress={function () { return setFlash(function (prevFlash) { return !prevFlash; }); }}>
                            <Icon_1.default height={32} width={32} src={flash ? Expensicons.Bolt : Expensicons.boltSlash} fill={theme.textSupporting}/>
                        </PressableWithFeedback_1.default>)}
                </react_native_1.View>

                {canUseMultiScan && (<ReceiptPreviews_1.default isMultiScanEnabled={isMultiScanEnabled} submit={submitReceipts}/>)}

                {startLocationPermissionFlow && !!receiptFiles.length && (<LocationPermissionModal_1.default startPermissionFlow={startLocationPermissionFlow} resetPermissionFlow={function () { return setStartLocationPermissionFlow(false); }} onGrant={function () { return navigateToConfirmationStep(receiptFiles, true); }} onDeny={function () {
                (0, IOU_1.updateLastLocationPermissionPrompt)();
                navigateToConfirmationStep(receiptFiles, false);
            }}/>)}
                {ErrorModal}
            </react_native_1.View>
        </StepScreenWrapper_1.default>);
}
IOURequestStepScan.displayName = 'IOURequestStepScan';
var IOURequestStepScanWithOnyx = IOURequestStepScan;
var IOURequestStepScanWithCurrentUserPersonalDetails = (0, withCurrentUserPersonalDetails_1.default)(IOURequestStepScanWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepScanWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepScanWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepScanWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepScanWithWritableReportOrNotFound);
exports.default = IOURequestStepScanWithFullTransactionOrNotFound;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
var react_native_permissions_1 = require("react-native-permissions");
var ConfirmModal_1 = require("@components/ConfirmModal");
var Illustrations = require("@components/Icon/Illustrations");
var ELECTRON_EVENTS_1 = require("@desktop/ELECTRON_EVENTS");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getPlatform_1 = require("@libs/getPlatform");
var Visibility_1 = require("@libs/Visibility");
var LocationPermission_1 = require("@pages/iou/request/step/IOURequestStepScan/LocationPermission");
var CONST_1 = require("@src/CONST");
function LocationPermissionModal(_a) {
    var startPermissionFlow = _a.startPermissionFlow, resetPermissionFlow = _a.resetPermissionFlow, onDeny = _a.onDeny, onGrant = _a.onGrant, onInitialGetLocationCompleted = _a.onInitialGetLocationCompleted;
    var _b = (0, react_1.useState)(false), hasError = _b[0], setHasError = _b[1];
    var _c = (0, react_1.useState)(false), showModal = _c[0], setShowModal = _c[1];
    var _d = (0, react_1.useState)(false), isLoading = _d[0], setIsLoading = _d[1];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isWeb = (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.WEB;
    var checkPermission = (0, react_1.useCallback)(function () {
        (0, LocationPermission_1.getLocationPermission)().then(function (status) {
            if (status !== react_native_permissions_1.RESULTS.GRANTED && status !== react_native_permissions_1.RESULTS.LIMITED) {
                return;
            }
            onGrant();
        });
    }, [onGrant]);
    var debouncedCheckPermission = (0, react_1.useMemo)(function () { return (0, debounce_1.default)(checkPermission, CONST_1.default.TIMING.USE_DEBOUNCED_STATE_DELAY); }, [checkPermission]);
    (0, react_1.useEffect)(function () {
        if (!showModal) {
            return;
        }
        var unsubscribe = Visibility_1.default.onVisibilityChange(function () {
            debouncedCheckPermission();
        });
        var intervalId = setInterval(function () {
            debouncedCheckPermission();
        }, CONST_1.default.TIMING.LOCATION_UPDATE_INTERVAL);
        return function () {
            unsubscribe();
            clearInterval(intervalId);
        };
    }, [showModal, debouncedCheckPermission]);
    (0, react_1.useEffect)(function () {
        if (!startPermissionFlow) {
            return;
        }
        (0, LocationPermission_1.getLocationPermission)().then(function (status) {
            onInitialGetLocationCompleted === null || onInitialGetLocationCompleted === void 0 ? void 0 : onInitialGetLocationCompleted();
            if (status === react_native_permissions_1.RESULTS.GRANTED || status === react_native_permissions_1.RESULTS.LIMITED) {
                return onGrant();
            }
            setShowModal(true);
            setHasError(status === react_native_permissions_1.RESULTS.BLOCKED);
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- We only want to run this effect when startPermissionFlow changes
    }, [startPermissionFlow]);
    var handledBlockedPermission = function (cb) { return function () {
        setIsLoading(true);
        if (hasError) {
            window.electron.invoke(ELECTRON_EVENTS_1.default.OPEN_LOCATION_SETTING);
            return;
        }
        cb();
    }; };
    var grantLocationPermission = handledBlockedPermission(function () {
        (0, LocationPermission_1.requestLocationPermission)()
            .then(function (status) {
            if (status === react_native_permissions_1.RESULTS.GRANTED || status === react_native_permissions_1.RESULTS.LIMITED) {
                onGrant();
            }
            else {
                onDeny();
            }
        })
            .finally(function () {
            setIsLoading(false);
            setShowModal(false);
            setHasError(false);
        });
    });
    var skipLocationPermission = function () {
        onDeny();
        setShowModal(false);
        setHasError(false);
    };
    var getConfirmText = function () {
        if (!hasError) {
            return translate('common.continue');
        }
        return isWeb ? translate('common.buttonConfirm') : translate('common.settings');
    };
    var closeModal = function () {
        setShowModal(false);
        resetPermissionFlow();
    };
    var locationErrorMessage = (0, react_1.useMemo)(function () { return (isWeb ? 'receipt.allowLocationFromSetting' : 'receipt.locationErrorMessage'); }, [isWeb]);
    return (<ConfirmModal_1.default shouldShowCancelButton={!(isWeb && hasError)} onModalHide={function () {
            setHasError(false);
            resetPermissionFlow();
        }} isVisible={showModal} onConfirm={grantLocationPermission} onCancel={skipLocationPermission} onBackdropPress={closeModal} confirmText={getConfirmText()} cancelText={translate('common.notNow')} promptStyles={[styles.textLabelSupportingEmptyValue, styles.mb4]} title={translate(hasError ? 'receipt.locationErrorTitle' : 'receipt.locationAccessTitle')} titleContainerStyles={[styles.mt2, styles.mb0]} titleStyles={[styles.textHeadline]} iconSource={Illustrations.ReceiptLocationMarker} iconFill={false} iconWidth={140} iconHeight={120} shouldCenterIcon shouldReverseStackedButtons prompt={translate(hasError ? locationErrorMessage : 'receipt.locationAccessMessage')} isConfirmLoading={isLoading}/>);
}
LocationPermissionModal.displayName = 'LocationPermissionModal';
exports.default = LocationPermissionModal;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_permissions_1 = require("react-native-permissions");
var ConfirmModal_1 = require("@components/ConfirmModal");
var Illustrations = require("@components/Icon/Illustrations");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var LocationPermission_1 = require("@pages/iou/request/step/IOURequestStepScan/LocationPermission");
function LocationPermissionModal(_a) {
    var startPermissionFlow = _a.startPermissionFlow, resetPermissionFlow = _a.resetPermissionFlow, onDeny = _a.onDeny, onGrant = _a.onGrant, onInitialGetLocationCompleted = _a.onInitialGetLocationCompleted;
    var _b = (0, react_1.useState)(false), hasError = _b[0], setHasError = _b[1];
    var _c = (0, react_1.useState)(false), showModal = _c[0], setShowModal = _c[1];
    var _d = (0, react_1.useState)(false), isLoading = _d[0], setIsLoading = _d[1];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
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
        if (hasError && react_native_1.Linking.openSettings) {
            react_native_1.Linking.openSettings();
            setShowModal(false);
            setHasError(false);
            resetPermissionFlow();
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
            else if (status === react_native_permissions_1.RESULTS.BLOCKED) {
                setHasError(true);
                return;
            }
            else {
                onDeny();
            }
            setShowModal(false);
            setHasError(false);
        })
            .finally(function () {
            setIsLoading(false);
        });
    });
    var skipLocationPermission = function () {
        onDeny();
        setShowModal(false);
        setHasError(false);
    };
    var closeModal = function () {
        setShowModal(false);
        resetPermissionFlow();
    };
    return (<ConfirmModal_1.default isVisible={showModal} onConfirm={grantLocationPermission} onCancel={skipLocationPermission} onBackdropPress={closeModal} confirmText={hasError ? translate('common.settings') : translate('common.continue')} cancelText={translate('common.notNow')} prompt={translate(hasError ? 'receipt.locationErrorMessage' : 'receipt.locationAccessMessage')} promptStyles={[styles.textLabelSupportingEmptyValue, styles.mb4]} title={translate(hasError ? 'receipt.locationErrorTitle' : 'receipt.locationAccessTitle')} titleContainerStyles={[styles.mt2, styles.mb0]} titleStyles={[styles.textHeadline]} iconSource={Illustrations.ReceiptLocationMarker} iconFill={false} iconWidth={140} iconHeight={120} shouldCenterIcon shouldReverseStackedButtons isConfirmLoading={isLoading}/>);
}
LocationPermissionModal.displayName = 'LocationPermissionModal';
exports.default = LocationPermissionModal;

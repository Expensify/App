"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddressSearch_1 = require("@components/AddressSearch");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ConfirmModal_1 = require("@components/ConfirmModal");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useLocationBias_1 = require("@hooks/useLocationBias");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useThreeDotsAnchorPosition_1 = require("@hooks/useThreeDotsAnchorPosition");
var Browser_1 = require("@libs/Browser");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var variables_1 = require("@styles/variables");
var Transaction_1 = require("@userActions/Transaction");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
// Only grab the most recent 20 waypoints because that's all that is shown in the UI. This also puts them into the format of data
// that the google autocomplete component expects for it's "predefined places" feature.
function recentWaypointsSelector(waypoints) {
    if (waypoints === void 0) { waypoints = []; }
    return waypoints
        .slice(0, CONST_1.default.RECENT_WAYPOINTS_NUMBER)
        .filter(function (waypoint) { var _a; return ((_a = waypoint.keyForList) === null || _a === void 0 ? void 0 : _a.includes(CONST_1.default.YOUR_LOCATION_TEXT)) !== true; })
        .map(function (waypoint) {
        var _a, _b, _c;
        return ({
            name: waypoint.name,
            description: (_a = waypoint.address) !== null && _a !== void 0 ? _a : '',
            geometry: {
                location: {
                    lat: (_b = waypoint.lat) !== null && _b !== void 0 ? _b : 0,
                    lng: (_c = waypoint.lng) !== null && _c !== void 0 ? _c : 0,
                },
            },
        });
    });
}
function IOURequestStepWaypoint(_a) {
    var _b, _c, _d, _e;
    var _f = _a.route.params, action = _f.action, backTo = _f.backTo, iouType = _f.iouType, pageIndex = _f.pageIndex, reportID = _f.reportID, transactionID = _f.transactionID, transaction = _a.transaction;
    var styles = (0, useThemeStyles_1.default)();
    var threeDotsAnchorPosition = (0, useThreeDotsAnchorPosition_1.default)(styles.threeDotsPopoverOffsetNoCloseButton);
    var _g = (0, react_1.useState)(false), isDeleteStopModalOpen = _g[0], setIsDeleteStopModalOpen = _g[1];
    var _h = (0, react_1.useState)(), restoreFocusType = _h[0], setRestoreFocusType = _h[1];
    var navigation = (0, native_1.useNavigation)();
    var isFocused = navigation.isFocused();
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var textInput = (0, react_1.useRef)(null);
    var parsedWaypointIndex = parseInt(pageIndex, 10);
    var allWaypoints = (_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.waypoints) !== null && _c !== void 0 ? _c : {};
    var currentWaypoint = (_d = allWaypoints["waypoint".concat(pageIndex)]) !== null && _d !== void 0 ? _d : {};
    var waypointCount = Object.keys(allWaypoints).length;
    var filledWaypointCount = Object.values(allWaypoints).filter(function (waypoint) { return !(0, EmptyObject_1.isEmptyObject)(waypoint); }).length;
    var _j = (0, react_1.useState)(false), caretHidden = _j[0], setCaretHidden = _j[1];
    var userLocation = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_LOCATION, { canBeMissing: true })[0];
    var recentWaypoints = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_RECENT_WAYPOINTS, { selector: recentWaypointsSelector, canBeMissing: true })[0];
    var waypointDescriptionKey = (0, react_1.useMemo)(function () {
        switch (parsedWaypointIndex) {
            case 0:
                return 'distance.waypointDescription.start';
            default:
                return 'distance.waypointDescription.stop';
        }
    }, [parsedWaypointIndex]);
    var locationBias = (0, useLocationBias_1.default)(allWaypoints, userLocation);
    var waypointAddress = (_e = currentWaypoint.address) !== null && _e !== void 0 ? _e : '';
    // Hide the menu when there is only start and finish waypoint
    var shouldShowThreeDotsButton = waypointCount > 2 && !!waypointAddress;
    var shouldDisableEditor = isFocused &&
        (Number.isNaN(parsedWaypointIndex) || parsedWaypointIndex < 0 || parsedWaypointIndex > waypointCount || (filledWaypointCount < 2 && parsedWaypointIndex >= waypointCount));
    var goBack = function () {
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        Navigation_1.default.goBack(ROUTES_1.default.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, transactionID, reportID));
    };
    var validate = function (values) {
        var _a;
        var errors = {};
        var waypointValue = (_a = values["waypoint".concat(pageIndex)]) !== null && _a !== void 0 ? _a : '';
        if (isOffline && waypointValue !== '' && !(0, ValidationUtils_1.isValidAddress)(waypointValue)) {
            (0, ErrorUtils_1.addErrorMessage)(errors, "waypoint".concat(pageIndex), translate('bankAccount.error.address'));
        }
        // If the user is online, and they are trying to save a value without using the autocomplete, show an error message instructing them to use a selected address instead.
        // That enables us to save the address with coordinates when it is selected
        if (!isOffline && waypointValue !== '' && waypointAddress !== waypointValue) {
            (0, ErrorUtils_1.addErrorMessage)(errors, "waypoint".concat(pageIndex), translate('distance.error.selectSuggestedAddress'));
        }
        return errors;
    };
    var save = function (waypoint) { return (0, Transaction_1.saveWaypoint)(transactionID, pageIndex, waypoint, (0, IOUUtils_1.shouldUseTransactionDraft)(action)); };
    var submit = function (values) {
        var _a, _b, _c, _d, _e;
        var waypointValue = (_a = values["waypoint".concat(pageIndex)]) !== null && _a !== void 0 ? _a : '';
        // Allows letting you set a waypoint to an empty value
        if (waypointValue === '') {
            (0, Transaction_1.removeWaypoint)(transaction, pageIndex, (0, IOUUtils_1.shouldUseTransactionDraft)(action));
        }
        // While the user is offline, the auto-complete address search will not work
        // Therefore, we're going to save the waypoint as just the address, and the lat/long will be filled in on the backend
        if (isOffline && waypointValue) {
            var waypoint = {
                address: waypointValue !== null && waypointValue !== void 0 ? waypointValue : '',
                name: (_b = values.name) !== null && _b !== void 0 ? _b : '',
                lat: (_c = values.lat) !== null && _c !== void 0 ? _c : 0,
                lng: (_d = values.lng) !== null && _d !== void 0 ? _d : 0,
                keyForList: "".concat(((_e = values.name) !== null && _e !== void 0 ? _e : 'waypoint'), "_").concat(Date.now()),
            };
            save(waypoint);
        }
        // Other flows will be handled by selecting a waypoint with selectWaypoint as this is mainly for the offline flow
        goBack();
    };
    var deleteStopAndHideModal = function () {
        (0, Transaction_1.removeWaypoint)(transaction, pageIndex, (0, IOUUtils_1.shouldUseTransactionDraft)(action));
        setRestoreFocusType(CONST_1.default.MODAL.RESTORE_FOCUS_TYPE.DELETE);
        setIsDeleteStopModalOpen(false);
        goBack();
    };
    var selectWaypoint = function (values) {
        var _a, _b, _c, _d, _e;
        var waypoint = {
            lat: (_a = values.lat) !== null && _a !== void 0 ? _a : 0,
            lng: (_b = values.lng) !== null && _b !== void 0 ? _b : 0,
            address: (_c = values.address) !== null && _c !== void 0 ? _c : '',
            name: (_d = values.name) !== null && _d !== void 0 ? _d : '',
            keyForList: "".concat((_e = values.name) !== null && _e !== void 0 ? _e : 'waypoint', "_").concat(Date.now()),
        };
        (0, Transaction_1.saveWaypoint)(transactionID, pageIndex, waypoint, (0, IOUUtils_1.shouldUseTransactionDraft)(action));
        goBack();
    };
    var onScroll = (0, react_1.useCallback)(function () {
        var _a;
        if (!(0, Browser_1.isSafari)()) {
            return;
        }
        // eslint-disable-next-line react-compiler/react-compiler
        (_a = textInput.current) === null || _a === void 0 ? void 0 : _a.measureInWindow(function (x, y) {
            if (y < variables_1.default.contentHeaderHeight) {
                setCaretHidden(true);
            }
            else {
                setCaretHidden(false);
            }
        });
    }, []);
    var resetCaretHiddenValue = (0, react_1.useCallback)(function () {
        setCaretHidden(false);
    }, []);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom onEntryTransitionEnd={function () { var _a; return (_a = textInput.current) === null || _a === void 0 ? void 0 : _a.focus(); }} shouldEnableMaxHeight testID={IOURequestStepWaypoint.displayName}>
            <FullPageNotFoundView_1.default shouldShow={shouldDisableEditor}>
                <HeaderWithBackButton_1.default title={translate(waypointDescriptionKey)} shouldShowBackButton onBackButtonPress={goBack} shouldShowThreeDotsButton={shouldShowThreeDotsButton} shouldSetModalVisibility={false} threeDotsAnchorPosition={threeDotsAnchorPosition} threeDotsMenuItems={[
            {
                icon: Expensicons.Trashcan,
                text: translate('distance.deleteWaypoint'),
                onSelected: function () {
                    setRestoreFocusType(undefined);
                    setIsDeleteStopModalOpen(true);
                },
                shouldCallAfterModalHide: true,
            },
        ]}/>
                <ConfirmModal_1.default title={translate('distance.deleteWaypoint')} isVisible={isDeleteStopModalOpen} onConfirm={deleteStopAndHideModal} onCancel={function () { return setIsDeleteStopModalOpen(false); }} shouldSetModalVisibility={false} prompt={translate('distance.deleteWaypointConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} shouldEnableNewFocusManagement danger restoreFocusType={restoreFocusType}/>
                <FormProvider_1.default style={[styles.flexGrow1, styles.mh5]} formID={ONYXKEYS_1.default.FORMS.WAYPOINT_FORM} enabledWhenOffline validate={validate} onSubmit={submit} shouldValidateOnChange={false} shouldValidateOnBlur={false} submitButtonText={translate('common.save')} shouldHideFixErrorsAlert onScroll={onScroll}>
                    <react_native_1.View>
                        <InputWrapper_1.default InputComponent={AddressSearch_1.default} locationBias={locationBias} canUseCurrentLocation inputID={"waypoint".concat(pageIndex)} ref={function (e) {
            textInput.current = e;
        }} hint={!isOffline ? translate('distance.error.selectSuggestedAddress') : ''} containerStyles={[styles.mt4]} label={translate('distance.address')} defaultValue={waypointAddress} onPress={selectWaypoint} maxInputLength={CONST_1.default.FORM_CHARACTER_LIMIT} renamedInputKeys={{
            address: "waypoint".concat(pageIndex),
            city: '',
            country: '',
            street: '',
            street2: '',
            zipCode: '',
            lat: '',
            lng: '',
            state: '',
        }} predefinedPlaces={recentWaypoints} resultTypes="" caretHidden={caretHidden} onValueChange={resetCaretHiddenValue}/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
IOURequestStepWaypoint.displayName = 'IOURequestStepWaypoint';
exports.default = (0, withWritableReportOrNotFound_1.default)((0, withFullTransactionOrNotFound_1.default)(IOURequestStepWaypoint), true);

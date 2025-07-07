"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportUtils_1 = require("@libs/ReportUtils");
var TripReservationUtils_1 = require("@libs/TripReservationUtils");
var Link_1 = require("@userActions/Link");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var CarTripDetails_1 = require("./CarTripDetails");
var FlightTripDetails_1 = require("./FlightTripDetails");
var HotelTripDetails_1 = require("./HotelTripDetails");
var TrainTripDetails_1 = require("./TrainTripDetails");
function pickTravelerPersonalDetails(personalDetails, reservation) {
    var _a;
    return (_a = Object.values(personalDetails !== null && personalDetails !== void 0 ? personalDetails : {})) === null || _a === void 0 ? void 0 : _a.find(function (personalDetail) { var _a; return (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) === ((_a = reservation === null || reservation === void 0 ? void 0 : reservation.travelerPersonalInfo) === null || _a === void 0 ? void 0 : _a.email); });
}
function TripDetailsPage(_a) {
    var _b;
    var route = _a.route;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isBlockedFromSpotnanaTravel = (0, usePermissions_1.default)().isBlockedFromSpotnanaTravel;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _c = (0, react_1.useState)(false), isModifyTripLoading = _c[0], setIsModifyTripLoading = _c[1];
    var _d = (0, react_1.useState)(false), isTripSupportLoading = _d[0], setIsTripSupportLoading = _d[1];
    var _e = route.params, transactionID = _e.transactionID, sequenceIndex = _e.sequenceIndex, pnr = _e.pnr, reportID = _e.reportID;
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: true })[0];
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.reportID), { canBeMissing: true })[0];
    var parentReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_b = report === null || report === void 0 ? void 0 : report.parentReportID) !== null && _b !== void 0 ? _b : reportID), { canBeMissing: true })[0];
    var tripID = (0, ReportUtils_1.getTripIDFromTransactionParentReportID)(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID);
    // If pnr is not passed and transaction is present, we want to use transaction to get the trip reservations as the provided sequenceIndex now refers to the position of trip reservation in transaction's reservation list
    var tripReservations = (0, TripReservationUtils_1.getReservationsFromTripReport)(!Number(pnr) && transaction ? undefined : parentReport, transaction ? [transaction] : []);
    var _f = (0, TripReservationUtils_1.getReservationDetailsFromSequence)(tripReservations, Number(sequenceIndex)), reservation = _f.reservation, prevReservation = _f.prevReservation, reservationType = _f.reservationType, reservationIcon = _f.reservationIcon;
    var travelerPersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { selector: function (personalDetails) { return pickTravelerPersonalDetails(personalDetails, reservation); }, canBeMissing: true })[0];
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom shouldEnablePickerAvoiding={false} shouldEnableMaxHeight testID={TripDetailsPage.displayName} shouldShowOfflineIndicatorInWideScreen>
            <FullPageNotFoundView_1.default shouldForceFullScreen shouldShow={!reservation || (!CONFIG_1.default.IS_HYBRID_APP && isBlockedFromSpotnanaTravel)}>
                <HeaderWithBackButton_1.default title={reservationType ? "".concat(translate("travel.".concat(reservationType)), " ").concat(translate('common.details').toLowerCase()) : translate('common.details')} shouldShowBackButton icon={reservationIcon} iconHeight={20} iconWidth={20} iconStyles={[StyleUtils.getTripReservationIconContainer(false), styles.mr3]} iconFill={theme.icon}/>
                <ScrollView_1.default>
                    {!!reservation && reservationType === CONST_1.default.RESERVATION_TYPE.FLIGHT && (<FlightTripDetails_1.default prevReservation={prevReservation} reservation={reservation} personalDetails={travelerPersonalDetails}/>)}
                    {!!reservation && reservationType === CONST_1.default.RESERVATION_TYPE.HOTEL && (<HotelTripDetails_1.default reservation={reservation} personalDetails={travelerPersonalDetails}/>)}
                    {!!reservation && reservationType === CONST_1.default.RESERVATION_TYPE.CAR && (<CarTripDetails_1.default reservation={reservation} personalDetails={travelerPersonalDetails}/>)}
                    {!!reservation && reservationType === CONST_1.default.RESERVATION_TYPE.TRAIN && (<TrainTripDetails_1.default reservation={reservation} personalDetails={travelerPersonalDetails}/>)}
                    <MenuItem_1.default title={translate('travel.modifyTrip')} icon={Expensicons.Pencil} iconRight={Expensicons.NewWindow} shouldShowRightIcon onPress={function () {
            var _a;
            setIsModifyTripLoading(true);
            (_a = (0, Link_1.openTravelDotLink)(activePolicyID, CONST_1.default.TRIP_ID_PATH(tripID))) === null || _a === void 0 ? void 0 : _a.finally(function () {
                setIsModifyTripLoading(false);
            });
        }} wrapperStyle={styles.mt3} shouldShowLoadingSpinnerIcon={isModifyTripLoading} disabled={isModifyTripLoading || isOffline}/>
                    <MenuItem_1.default title={translate('travel.tripSupport')} icon={Expensicons.Phone} iconRight={Expensicons.NewWindow} shouldShowRightIcon onPress={function () {
            var _a;
            setIsTripSupportLoading(true);
            (_a = (0, Link_1.openTravelDotLink)(activePolicyID, CONST_1.default.TRIP_SUPPORT)) === null || _a === void 0 ? void 0 : _a.finally(function () {
                setIsTripSupportLoading(false);
            });
        }} shouldShowLoadingSpinnerIcon={isTripSupportLoading} disabled={isTripSupportLoading || isOffline}/>
                </ScrollView_1.default>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
TripDetailsPage.displayName = 'TripDetailsPage';
exports.default = TripDetailsPage;

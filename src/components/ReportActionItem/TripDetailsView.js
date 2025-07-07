"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationView = ReservationView;
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var SpacerView_1 = require("@components/SpacerView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var StringUtils_1 = require("@libs/StringUtils");
var variables_1 = require("@styles/variables");
var Expensicons = require("@src/components/Icon/Expensicons");
var CONST_1 = require("@src/CONST");
var TripReservationUtils_1 = require("@src/libs/TripReservationUtils");
var ROUTES_1 = require("@src/ROUTES");
function ReservationView(_a) {
    var reservation = _a.reservation, transactionID = _a.transactionID, tripRoomReportID = _a.tripRoomReportID, sequenceIndex = _a.sequenceIndex;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var reservationIcon = (0, TripReservationUtils_1.getTripReservationIcon)(reservation.type);
    var formatAirportInfo = function (reservationTimeDetails) {
        var longName = (reservationTimeDetails === null || reservationTimeDetails === void 0 ? void 0 : reservationTimeDetails.longName) ? "".concat(reservationTimeDetails === null || reservationTimeDetails === void 0 ? void 0 : reservationTimeDetails.longName, " ") : '';
        var shortName = (reservationTimeDetails === null || reservationTimeDetails === void 0 ? void 0 : reservationTimeDetails.shortName) ? "".concat(reservationTimeDetails === null || reservationTimeDetails === void 0 ? void 0 : reservationTimeDetails.shortName) : '';
        shortName = longName && shortName ? "(".concat(shortName, ")") : shortName;
        return "".concat(longName).concat(shortName);
    };
    var getFormattedDate = function () {
        switch (reservation.type) {
            case CONST_1.default.RESERVATION_TYPE.FLIGHT:
                return DateUtils_1.default.getFormattedTransportDate(new Date(reservation.start.date));
            case CONST_1.default.RESERVATION_TYPE.HOTEL:
            case CONST_1.default.RESERVATION_TYPE.CAR:
                return DateUtils_1.default.getFormattedReservationRangeDate(new Date(reservation.start.date), new Date(reservation.end.date));
            default:
                return DateUtils_1.default.formatToLongDateWithWeekday(new Date(reservation.start.date));
        }
    };
    var formattedDate = getFormattedDate();
    var bottomDescription = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g;
        var code = (0, TripReservationUtils_1.getTripReservationCode)(reservation);
        if (reservation.type === CONST_1.default.RESERVATION_TYPE.FLIGHT) {
            var longName = ((_a = reservation.company) === null || _a === void 0 ? void 0 : _a.longName) ? "".concat((_b = reservation.company) === null || _b === void 0 ? void 0 : _b.longName, " \u2022 ") : '';
            var shortName = ((_c = reservation === null || reservation === void 0 ? void 0 : reservation.company) === null || _c === void 0 ? void 0 : _c.shortName) ? "".concat((_d = reservation === null || reservation === void 0 ? void 0 : reservation.company) === null || _d === void 0 ? void 0 : _d.shortName, " ") : '';
            return "".concat(code).concat(longName).concat(shortName).concat((_e = reservation.route) === null || _e === void 0 ? void 0 : _e.number);
        }
        if (reservation.type === CONST_1.default.RESERVATION_TYPE.HOTEL) {
            return "".concat(code).concat(StringUtils_1.default.removeDoubleQuotes(reservation.start.address));
        }
        if (reservation.type === CONST_1.default.RESERVATION_TYPE.CAR) {
            var vendor = reservation.vendor ? "".concat(reservation.vendor, " \u2022 ") : '';
            return "".concat(vendor).concat(reservation.start.location);
        }
        if (reservation.type === CONST_1.default.RESERVATION_TYPE.TRAIN) {
            return (_f = reservation.route) === null || _f === void 0 ? void 0 : _f.name;
        }
        return (_g = StringUtils_1.default.removeDoubleQuotes(reservation.start.address)) !== null && _g !== void 0 ? _g : reservation.start.location;
    }, [reservation]);
    var titleComponent = function () {
        var _a, _b;
        if (reservation.type === CONST_1.default.RESERVATION_TYPE.FLIGHT || reservation.type === CONST_1.default.RESERVATION_TYPE.TRAIN) {
            return (<react_native_1.View style={styles.gap1}>
                    <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                        <Text_1.default style={[styles.textStrong, styles.lh20, shouldUseNarrowLayout && styles.flex1]}>{formatAirportInfo(reservation.start)}</Text_1.default>
                        <Icon_1.default src={Expensicons.ArrowRightLong} width={variables_1.default.iconSizeSmall} height={variables_1.default.iconSizeSmall} fill={theme.icon}/>
                        <Text_1.default style={[styles.textStrong, styles.lh20, shouldUseNarrowLayout && styles.flex1]}>{formatAirportInfo(reservation.end)}</Text_1.default>
                    </react_native_1.View>
                    {!!bottomDescription && <Text_1.default style={[styles.textSmall, styles.colorMuted, styles.lh14]}>{bottomDescription}</Text_1.default>}
                </react_native_1.View>);
        }
        return (<react_native_1.View style={styles.gap1}>
                <Text_1.default numberOfLines={1} style={[styles.textStrong, styles.lh20]}>
                    {reservation.type === CONST_1.default.RESERVATION_TYPE.CAR ? (_a = reservation.carInfo) === null || _a === void 0 ? void 0 : _a.name : expensify_common_1.Str.recapitalize((_b = reservation.start.longName) !== null && _b !== void 0 ? _b : '')}
                </Text_1.default>
                {!!bottomDescription && (<Text_1.default style={[styles.textSmall, styles.colorMuted, styles.lh14]} testID={CONST_1.default.RESERVATION_ADDRESS_TEST_ID}>
                        {bottomDescription}
                    </Text_1.default>)}
            </react_native_1.View>);
    };
    return (<MenuItemWithTopDescription_1.default description={formattedDate} descriptionTextStyle={[styles.textLabelSupporting, styles.lh16]} titleComponent={titleComponent()} titleContainerStyle={[styles.justifyContentStart, styles.gap1]} secondaryIcon={reservationIcon} isSecondaryIconHoverable shouldShowRightIcon wrapperStyle={[styles.taskDescriptionMenuItem]} shouldGreyOutWhenDisabled={false} numberOfLinesTitle={0} interactive shouldStackHorizontally={false} onSecondaryInteraction={function () { }} iconHeight={20} iconWidth={20} iconStyles={[StyleUtils.getTripReservationIconContainer(false), styles.mr3]} secondaryIconFill={theme.icon} onPress={function () {
            return Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_TRIP_DETAILS.getRoute(tripRoomReportID, transactionID, String(reservation.reservationID), sequenceIndex, Navigation_1.default.getReportRHPActiveRoute()));
        }}/>);
}
function TripDetailsView(_a) {
    var tripRoomReport = _a.tripRoomReport, shouldShowHorizontalRule = _a.shouldShowHorizontalRule, tripTransactions = _a.tripTransactions;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    if (!tripRoomReport) {
        return null;
    }
    var reservationsData = (0, TripReservationUtils_1.getReservationsFromTripReport)(tripRoomReport, tripTransactions);
    return (<react_native_1.View>
            <react_native_1.View style={[styles.flexRow, styles.pointerEventsNone, styles.containerWithSpaceBetween, styles.ph5, styles.pv2]}>
                <react_native_1.View style={[styles.flex1, styles.justifyContentCenter]}>
                    <Text_1.default style={[styles.textLabelSupporting]} numberOfLines={1}>
                        {translate('travel.tripSummary')}
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
            <>
                {reservationsData.map(function (_a) {
            var reservation = _a.reservation, transactionID = _a.transactionID, sequenceIndex = _a.sequenceIndex;
            return (<OfflineWithFeedback_1.default>
                            <ReservationView reservation={reservation} transactionID={transactionID} tripRoomReportID={tripRoomReport.reportID} sequenceIndex={sequenceIndex}/>
                        </OfflineWithFeedback_1.default>);
        })}
                <SpacerView_1.default shouldShow={shouldShowHorizontalRule} style={[shouldShowHorizontalRule && styles.reportHorizontalRule]}/>
            </>
        </react_native_1.View>);
}
TripDetailsView.displayName = 'TripDetailsView';
exports.default = TripDetailsView;

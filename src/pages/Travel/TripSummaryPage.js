"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var TripDetailsView_1 = require("@components/ReportActionItem/TripDetailsView");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var CONFIG_1 = require("@src/CONFIG");
var TripReservationUtils = require("@src/libs/TripReservationUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function TripSummaryPage(_a) {
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(route.params.reportID), { canBeMissing: true })[0];
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(route.params.transactionID), { canBeMissing: true })[0];
    var reservationsData = TripReservationUtils.getReservationsFromTripReport(report, transaction ? [transaction] : []);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight testID={TripSummaryPage.displayName} shouldShowOfflineIndicatorInWideScreen>
            <FullPageNotFoundView_1.default shouldForceFullScreen shouldShow={reservationsData.length === 0 || !CONFIG_1.default.IS_HYBRID_APP}>
                <HeaderWithBackButton_1.default title={translate("travel.tripDetails")} shouldShowBackButton/>
                <ScrollView_1.default>
                    {reservationsData.map(function (_a) {
            var reservation = _a.reservation, transactionID = _a.transactionID, sequenceIndex = _a.sequenceIndex;
            return (<OfflineWithFeedback_1.default>
                                <TripDetailsView_1.ReservationView reservation={reservation} transactionID={transactionID} tripRoomReportID={route.params.reportID} sequenceIndex={sequenceIndex}/>
                            </OfflineWithFeedback_1.default>);
        })}
                </ScrollView_1.default>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
TripSummaryPage.displayName = 'TripSummaryPage';
exports.default = TripSummaryPage;

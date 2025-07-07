"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var CONST_1 = require("@src/CONST");
function CarTripDetails(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var reservation = _a.reservation, personalDetails = _a.personalDetails;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var pickUpDate = DateUtils_1.default.getFormattedTransportDateAndHour(new Date(reservation.start.date));
    var dropOffDate = DateUtils_1.default.getFormattedTransportDateAndHour(new Date(reservation.end.date));
    var cancellationText = reservation.cancellationPolicy;
    if (reservation.cancellationDeadline) {
        cancellationText = "".concat(translate('travel.carDetails.cancellationUntil'), " ").concat(DateUtils_1.default.getFormattedCancellationDate(new Date(reservation.cancellationDeadline)));
    }
    if (reservation.cancellationPolicy === null && reservation.cancellationDeadline === null) {
        cancellationText = translate('travel.carDetails.freeCancellation');
    }
    var displayName = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.displayName) !== null && _b !== void 0 ? _b : (_c = reservation.travelerPersonalInfo) === null || _c === void 0 ? void 0 : _c.name;
    return (<>
            <Text_1.default style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{reservation.vendor}</Text_1.default>
            <MenuItemWithTopDescription_1.default description={translate('travel.carDetails.pickUp')} titleComponent={<Text_1.default style={[styles.textLarge, styles.textHeadlineH2]}>
                        {pickUpDate.date} {CONST_1.default.DOT_SEPARATOR} {pickUpDate.hour}
                    </Text_1.default>} interactive={false} helperText={reservation.start.location} helperTextStyle={[styles.pb3, styles.mtn2]}/>
            <MenuItemWithTopDescription_1.default description={translate('travel.carDetails.dropOff')} titleComponent={<Text_1.default style={[styles.textLarge, styles.textHeadlineH2]}>
                        {dropOffDate.date} {CONST_1.default.DOT_SEPARATOR} {dropOffDate.hour}
                    </Text_1.default>} interactive={false} helperText={reservation.end.location} helperTextStyle={[styles.pb3, styles.mtn2]}/>
            {!!((_d = reservation.carInfo) === null || _d === void 0 ? void 0 : _d.name) && (<MenuItemWithTopDescription_1.default description={translate('travel.carDetails.carType')} title={reservation.carInfo.name} interactive={false}/>)}
            {!!cancellationText && (<MenuItemWithTopDescription_1.default description={translate('travel.carDetails.cancellation')} title={cancellationText} interactive={false} numberOfLinesTitle={2}/>)}
            {!!reservation.reservationID && (<MenuItemWithTopDescription_1.default description={translate('travel.carDetails.confirmation')} title={(_g = (_f = (_e = reservation.confirmations) === null || _e === void 0 ? void 0 : _e.at(0)) === null || _f === void 0 ? void 0 : _f.value) !== null && _g !== void 0 ? _g : reservation.reservationID} copyValue={(_k = (_j = (_h = reservation.confirmations) === null || _h === void 0 ? void 0 : _h.at(0)) === null || _j === void 0 ? void 0 : _j.value) !== null && _k !== void 0 ? _k : reservation.reservationID}/>)}
            {!!displayName && (<MenuItem_1.default label={translate('travel.carDetails.driver')} title={displayName} icon={(_l = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.avatar) !== null && _l !== void 0 ? _l : Expensicons.FallbackAvatar} iconType={CONST_1.default.ICON_TYPE_AVATAR} description={(_m = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login) !== null && _m !== void 0 ? _m : (_o = reservation.travelerPersonalInfo) === null || _o === void 0 ? void 0 : _o.email} interactive={false} wrapperStyle={styles.pb3}/>)}
        </>);
}
CarTripDetails.displayName = 'CarTripDetails';
exports.default = CarTripDetails;

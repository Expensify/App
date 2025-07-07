"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var StringUtils_1 = require("@libs/StringUtils");
var CONST_1 = require("@src/CONST");
function HotelTripDetails(_a) {
    var _b;
    var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    var reservation = _a.reservation, personalDetails = _a.personalDetails;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var cancellationMapping = (_b = {},
        _b[CONST_1.default.CANCELLATION_POLICY.UNKNOWN] = translate('travel.hotelDetails.cancellationPolicies.unknown'),
        _b[CONST_1.default.CANCELLATION_POLICY.NON_REFUNDABLE] = translate('travel.hotelDetails.cancellationPolicies.nonRefundable'),
        _b[CONST_1.default.CANCELLATION_POLICY.FREE_CANCELLATION_UNTIL] = translate('travel.hotelDetails.cancellationPolicies.freeCancellationUntil'),
        _b[CONST_1.default.CANCELLATION_POLICY.PARTIALLY_REFUNDABLE] = translate('travel.hotelDetails.cancellationPolicies.partiallyRefundable'),
        _b);
    var checkInDate = DateUtils_1.default.getFormattedTransportDateAndHour(new Date(reservation.start.date));
    var checkOutDate = DateUtils_1.default.getFormattedTransportDateAndHour(new Date(reservation.end.date));
    var cancellationText = reservation.cancellationDeadline
        ? "".concat(translate('travel.hotelDetails.cancellationUntil'), " ").concat(DateUtils_1.default.getFormattedCancellationDate(new Date(reservation.cancellationDeadline)))
        : cancellationMapping[(_c = reservation.cancellationPolicy) !== null && _c !== void 0 ? _c : CONST_1.default.CANCELLATION_POLICY.UNKNOWN];
    var displayName = (_d = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.displayName) !== null && _d !== void 0 ? _d : (_e = reservation.travelerPersonalInfo) === null || _e === void 0 ? void 0 : _e.name;
    return (<>
            <Text_1.default style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{expensify_common_1.Str.recapitalize((_f = reservation.start.longName) !== null && _f !== void 0 ? _f : '')}</Text_1.default>
            <MenuItemWithTopDescription_1.default description={translate('common.address')} title={StringUtils_1.default.removeDoubleQuotes(reservation.start.address)} numberOfLinesTitle={2} pressableTestID={CONST_1.default.RESERVATION_ADDRESS_TEST_ID} copyValue={reservation.start.address}/>
            <MenuItemWithTopDescription_1.default description={translate('travel.hotelDetails.checkIn')} titleComponent={<Text_1.default style={[styles.textLarge, styles.textHeadlineH2]}>{checkInDate.date}</Text_1.default>} interactive={false}/>
            <MenuItemWithTopDescription_1.default description={translate('travel.hotelDetails.checkOut')} titleComponent={<Text_1.default style={[styles.textLarge, styles.textHeadlineH2]}>{checkOutDate.date}</Text_1.default>} interactive={false}/>

            {!!reservation.roomClass && (<MenuItemWithTopDescription_1.default description={translate('travel.hotelDetails.roomType')} title={reservation.roomClass.trim()} interactive={false}/>)}
            {!!cancellationText && (<MenuItemWithTopDescription_1.default description={translate('travel.hotelDetails.cancellation')} title={cancellationText} interactive={false} numberOfLinesTitle={2}/>)}
            {!!((_h = (_g = reservation.confirmations) === null || _g === void 0 ? void 0 : _g.at(0)) === null || _h === void 0 ? void 0 : _h.value) && (<MenuItemWithTopDescription_1.default description={translate('travel.hotelDetails.confirmation')} title={(_k = (_j = reservation.confirmations) === null || _j === void 0 ? void 0 : _j.at(0)) === null || _k === void 0 ? void 0 : _k.value} copyValue={(_m = (_l = reservation.confirmations) === null || _l === void 0 ? void 0 : _l.at(0)) === null || _m === void 0 ? void 0 : _m.value}/>)}
            {!!displayName && (<MenuItem_1.default label={translate('travel.hotelDetails.guest')} title={displayName} icon={(_o = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.avatar) !== null && _o !== void 0 ? _o : Expensicons.FallbackAvatar} iconType={CONST_1.default.ICON_TYPE_AVATAR} description={(_p = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login) !== null && _p !== void 0 ? _p : (_q = reservation.travelerPersonalInfo) === null || _q === void 0 ? void 0 : _q.email} interactive={false} wrapperStyle={styles.pb3}/>)}
        </>);
}
HotelTripDetails.displayName = 'HotelTripDetails';
exports.default = HotelTripDetails;

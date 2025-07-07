"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var CONST_1 = require("@src/CONST");
function TrainTripDetails(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var reservation = _a.reservation, personalDetails = _a.personalDetails;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var startDate = DateUtils_1.default.getFormattedTransportDateAndHour(new Date(reservation.start.date));
    var endDate = DateUtils_1.default.getFormattedTransportDateAndHour(new Date(reservation.end.date));
    var trainRouteDescription = "".concat(reservation.start.longName, " (").concat(reservation.start.shortName, ") ").concat(translate('common.conjunctionTo'), " ").concat(reservation.end.longName, " (").concat(reservation.end.shortName, ")");
    var trainDuration = DateUtils_1.default.getFormattedDurationBetweenDates(translate, new Date(reservation.start.date), new Date(reservation.end.date));
    var displayName = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.displayName) !== null && _b !== void 0 ? _b : (_c = reservation.travelerPersonalInfo) === null || _c === void 0 ? void 0 : _c.name;
    return (<>
            <Text_1.default style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{trainRouteDescription}</Text_1.default>

            <MenuItemWithTopDescription_1.default description={"".concat(translate('travel.train'), " ").concat(trainDuration ? "".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(trainDuration) : '')} title={(_d = reservation.route) === null || _d === void 0 ? void 0 : _d.name} copyValue={(_e = reservation.route) === null || _e === void 0 ? void 0 : _e.name}/>
            <MenuItemWithTopDescription_1.default description={translate('common.date')} title={startDate.date} interactive={false}/>

            <MenuItemWithTopDescription_1.default description={translate('travel.trainDetails.departs')} descriptionTextStyle={[styles.textLabelSupporting, styles.mb1]} titleComponent={<Text_1.default style={[styles.textLarge, styles.textHeadlineH2]}>{startDate.hour}</Text_1.default>} helperText={"".concat(reservation.start.longName, " (").concat(reservation.start.shortName, ")")} helperTextStyle={[styles.pb3, styles.mtn2]} interactive={false}/>
            <MenuItemWithTopDescription_1.default description={translate('travel.trainDetails.arrives')} descriptionTextStyle={[styles.textLabelSupporting, styles.mb1]} titleComponent={<Text_1.default style={[styles.textLarge, styles.textHeadlineH2]}>{endDate.hour}</Text_1.default>} helperText={"".concat(reservation.end.longName, " (").concat(reservation.end.shortName, ")")} helperTextStyle={[styles.pb3, styles.mtn2]} interactive={false}/>

            <react_native_1.View style={[styles.flexRow, styles.flexWrap]}>
                {!!reservation.coachNumber && (<react_native_1.View style={styles.w50}>
                        <MenuItemWithTopDescription_1.default description={translate('travel.trainDetails.coachNumber')} title={reservation.coachNumber} interactive={false}/>
                    </react_native_1.View>)}
                {!!reservation.seatNumber && (<react_native_1.View style={styles.w50}>
                        <MenuItemWithTopDescription_1.default description={translate('travel.trainDetails.seat')} title={reservation.seatNumber} interactive={false}/>
                    </react_native_1.View>)}
            </react_native_1.View>
            {!!((_g = (_f = reservation.confirmations) === null || _f === void 0 ? void 0 : _f.at(0)) === null || _g === void 0 ? void 0 : _g.value) && (<MenuItemWithTopDescription_1.default description={translate('travel.trainDetails.confirmation')} title={(_j = (_h = reservation.confirmations) === null || _h === void 0 ? void 0 : _h.at(0)) === null || _j === void 0 ? void 0 : _j.value} copyValue={(_l = (_k = reservation.confirmations) === null || _k === void 0 ? void 0 : _k.at(0)) === null || _l === void 0 ? void 0 : _l.value}/>)}

            {!!displayName && (<MenuItem_1.default label={translate('travel.trainDetails.passenger')} title={displayName} icon={(_m = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.avatar) !== null && _m !== void 0 ? _m : Expensicons.FallbackAvatar} iconType={CONST_1.default.ICON_TYPE_AVATAR} description={(_o = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login) !== null && _o !== void 0 ? _o : (_p = reservation.travelerPersonalInfo) === null || _p === void 0 ? void 0 : _p.email} interactive={false} wrapperStyle={styles.pb3}/>)}
        </>);
}
TrainTripDetails.displayName = 'TrainTripDetails';
exports.default = TrainTripDetails;

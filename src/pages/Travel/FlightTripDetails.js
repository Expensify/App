"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var RenderHTML_1 = require("@components/RenderHTML");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function FlightTripDetails(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    var reservation = _a.reservation, prevReservation = _a.prevReservation, personalDetails = _a.personalDetails;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var cabinClassMapping = {
        UNKNOWN_CABIN: translate('travel.flightDetails.cabinClasses.unknown'),
        ECONOMY: translate('travel.flightDetails.cabinClasses.economy'),
        PREMIUM_ECONOMY: translate('travel.flightDetails.cabinClasses.premiumEconomy'),
        BUSINESS: translate('travel.flightDetails.cabinClasses.business'),
        FIRST: translate('travel.flightDetails.cabinClasses.first'),
    };
    var startDate = DateUtils_1.default.getFormattedTransportDateAndHour(new Date(reservation.start.date));
    var endDate = DateUtils_1.default.getFormattedTransportDateAndHour(new Date(reservation.end.date));
    var prevFlightEndDate = prevReservation === null || prevReservation === void 0 ? void 0 : prevReservation.end.date;
    var layover = prevFlightEndDate && DateUtils_1.default.getFormattedDurationBetweenDates(translate, new Date(prevFlightEndDate), new Date(reservation.start.date));
    var flightDuration = reservation.duration ? DateUtils_1.default.getFormattedDuration(translate, reservation.duration) : '';
    var flightRouteDescription = "".concat(reservation.start.cityName, " (").concat(reservation.start.shortName, ") ").concat(translate('common.conjunctionTo'), " ").concat(reservation.end.cityName, " (").concat(reservation.end.shortName, ")");
    var displayName = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.displayName) !== null && _b !== void 0 ? _b : (_c = reservation.travelerPersonalInfo) === null || _c === void 0 ? void 0 : _c.name;
    return (<>
            <Text_1.default style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{flightRouteDescription}</Text_1.default>

            {!!layover && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mh5, styles.mv3, styles.gap2]}>
                    <Icon_1.default src={Expensicons.Hourglass} height={variables_1.default.iconSizeNormal} width={variables_1.default.iconSizeNormal} fill={theme.icon}/>
                    <RenderHTML_1.default html={translate('travel.flightDetails.layover', { layover: layover })}/>
                </react_native_1.View>)}
            <MenuItemWithTopDescription_1.default description={"".concat(translate('travel.flight'), " ").concat(CONST_1.default.DOT_SEPARATOR, " ").concat(flightDuration)} title={"".concat((_d = reservation.company) === null || _d === void 0 ? void 0 : _d.longName, " ").concat(CONST_1.default.DOT_SEPARATOR, " ").concat((_e = reservation.route) === null || _e === void 0 ? void 0 : _e.airlineCode)} copyValue={"".concat((_f = reservation.company) === null || _f === void 0 ? void 0 : _f.longName, " ").concat(CONST_1.default.DOT_SEPARATOR, " ").concat((_g = reservation.route) === null || _g === void 0 ? void 0 : _g.airlineCode)}/>
            <MenuItemWithTopDescription_1.default description={translate('common.date')} title={startDate.date} interactive={false}/>

            <MenuItemWithTopDescription_1.default description={translate('travel.flightDetails.takeOff')} descriptionTextStyle={[styles.textLabelSupporting, styles.mb1]} titleComponent={<Text_1.default style={[styles.textLarge, styles.textHeadlineH2]}>{startDate.hour}</Text_1.default>} helperText={"".concat(reservation.start.longName, " (").concat(reservation.start.shortName, ")").concat(((_h = reservation.arrivalGate) === null || _h === void 0 ? void 0 : _h.terminal) ? ", ".concat((_j = reservation.arrivalGate) === null || _j === void 0 ? void 0 : _j.terminal) : '')} helperTextStyle={[styles.pb3, styles.mtn2]} interactive={false}/>
            <MenuItemWithTopDescription_1.default description={translate('travel.flightDetails.landing')} descriptionTextStyle={[styles.textLabelSupporting, styles.mb1]} titleComponent={<Text_1.default style={[styles.textLarge, styles.textHeadlineH2]}>{endDate.hour}</Text_1.default>} helperText={"".concat(reservation.end.longName, " (").concat(reservation.end.shortName, ")")} helperTextStyle={[styles.pb3, styles.mtn2]} interactive={false}/>

            <react_native_1.View style={[styles.flexRow, styles.flexWrap]}>
                {!!((_k = reservation.route) === null || _k === void 0 ? void 0 : _k.number) && (<react_native_1.View style={styles.w50}>
                        <MenuItemWithTopDescription_1.default description={translate('travel.flightDetails.seat')} title={(_l = reservation.route) === null || _l === void 0 ? void 0 : _l.number} interactive={false}/>
                    </react_native_1.View>)}
                {!!((_m = reservation.route) === null || _m === void 0 ? void 0 : _m.class) && (<react_native_1.View style={styles.w50}>
                        <MenuItemWithTopDescription_1.default description={translate('travel.flightDetails.class')} title={cabinClassMapping[reservation.route.class] || reservation.route.class} interactive={false}/>
                    </react_native_1.View>)}
                {!!((_p = (_o = reservation.confirmations) === null || _o === void 0 ? void 0 : _o.at(0)) === null || _p === void 0 ? void 0 : _p.value) && (<react_native_1.View style={styles.w50}>
                        <MenuItemWithTopDescription_1.default description={translate('travel.flightDetails.recordLocator')} title={(_r = (_q = reservation.confirmations) === null || _q === void 0 ? void 0 : _q.at(0)) === null || _r === void 0 ? void 0 : _r.value} copyValue={(_t = (_s = reservation.confirmations) === null || _s === void 0 ? void 0 : _s.at(0)) === null || _t === void 0 ? void 0 : _t.value}/>
                    </react_native_1.View>)}
            </react_native_1.View>
            {!!displayName && (<MenuItem_1.default label={translate('travel.flightDetails.passenger')} title={displayName} icon={(_u = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.avatar) !== null && _u !== void 0 ? _u : Expensicons.FallbackAvatar} iconType={CONST_1.default.ICON_TYPE_AVATAR} description={(_v = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login) !== null && _v !== void 0 ? _v : (_w = reservation.travelerPersonalInfo) === null || _w === void 0 ? void 0 : _w.email} interactive={false} wrapperStyle={styles.pb3}/>)}
        </>);
}
FlightTripDetails.displayName = 'FlightTripDetails';
exports.default = FlightTripDetails;

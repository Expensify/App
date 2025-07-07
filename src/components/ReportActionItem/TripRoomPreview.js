"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Pressable_1 = require("@components/Pressable");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useTripTransactions_1 = require("@hooks/useTripTransactions");
var ControlSelection_1 = require("@libs/ControlSelection");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DateUtils_1 = require("@libs/DateUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Navigation_1 = require("@libs/Navigation/Navigation");
var TripReservationUtils_1 = require("@libs/TripReservationUtils");
var variables_1 = require("@styles/variables");
var Expensicons = require("@src/components/Icon/Expensicons");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function ReservationView(_a) {
    var _b, _c;
    var reservation = _a.reservation, onPress = _a.onPress;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var reservationIcon = (0, TripReservationUtils_1.getTripReservationIcon)(reservation.type);
    var title = reservation.type === CONST_1.default.RESERVATION_TYPE.CAR ? (_b = reservation.carInfo) === null || _b === void 0 ? void 0 : _b.name : expensify_common_1.Str.recapitalize((_c = reservation.start.longName) !== null && _c !== void 0 ? _c : '');
    var titleComponent = (<Text_1.default numberOfLines={1} style={styles.labelStrong}>
            {title}
        </Text_1.default>);
    if (reservation.type === CONST_1.default.RESERVATION_TYPE.FLIGHT || reservation.type === CONST_1.default.RESERVATION_TYPE.TRAIN) {
        var startName = reservation.type === CONST_1.default.RESERVATION_TYPE.FLIGHT ? reservation.start.shortName : reservation.start.longName;
        var endName = reservation.type === CONST_1.default.RESERVATION_TYPE.FLIGHT ? reservation.end.shortName : reservation.end.longName;
        titleComponent = (<react_native_1.View style={[styles.flexRow, styles.alignItemsStart]}>
                <react_native_1.View style={styles.tripReservationRow}>
                    <react_native_1.View style={styles.flexShrink1}>
                        <Text_1.default numberOfLines={2} style={[styles.labelStrong, styles.mr2]} ellipsizeMode="tail">
                            {startName}
                        </Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={styles.iconWrapper}>
                        <Icon_1.default src={Expensicons.ArrowRightLong} width={variables_1.default.iconSizeSmall} height={variables_1.default.iconSizeSmall} fill={theme.icon}/>
                    </react_native_1.View>
                </react_native_1.View>
                <react_native_1.View style={[styles.flex1, styles.ml2]}>
                    <Text_1.default numberOfLines={2} style={[styles.labelStrong]} ellipsizeMode="tail">
                        {endName}
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>);
    }
    return (<MenuItemWithTopDescription_1.default description={translate("travel.".concat(reservation.type))} descriptionTextStyle={styles.textMicro} titleComponent={titleComponent} titleContainerStyle={styles.gap1} secondaryIcon={reservationIcon} secondaryIconFill={theme.icon} wrapperStyle={[styles.taskDescriptionMenuItem, styles.p0]} shouldGreyOutWhenDisabled={false} numberOfLinesTitle={0} shouldRemoveBackground onPress={onPress} iconHeight={variables_1.default.iconSizeSmall} iconWidth={variables_1.default.iconSizeSmall} iconStyles={[StyleUtils.getTripReservationIconContainer(true), styles.mr3]} isSmallAvatarSubscriptMenu/>);
}
function TripRoomPreview(_a) {
    var _b, _c, _d, _e;
    var action = _a.action, chatReport = _a.chatReport, iouReport = _a.iouReport, containerStyles = _a.containerStyles, contextMenuAnchor = _a.contextMenuAnchor, _f = _a.isHovered, isHovered = _f === void 0 ? false : _f, _g = _a.checkIfContextMenuActive, checkIfContextMenuActive = _g === void 0 ? function () { } : _g, _h = _a.shouldDisplayContextMenu, shouldDisplayContextMenu = _h === void 0 ? true : _h;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var chatReportID = chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID;
    var tripTransactions = (0, useTripTransactions_1.default)(chatReportID);
    var reservationsData = (0, TripReservationUtils_1.getReservationsFromTripReport)(chatReport, tripTransactions);
    var dateInfo = ((_b = chatReport === null || chatReport === void 0 ? void 0 : chatReport.tripData) === null || _b === void 0 ? void 0 : _b.startDate) && ((_c = chatReport === null || chatReport === void 0 ? void 0 : chatReport.tripData) === null || _c === void 0 ? void 0 : _c.endDate)
        ? DateUtils_1.default.getFormattedDateRange(new Date(chatReport.tripData.startDate), new Date(chatReport.tripData.endDate))
        : '';
    var reportCurrency = (_d = iouReport === null || iouReport === void 0 ? void 0 : iouReport.currency) !== null && _d !== void 0 ? _d : chatReport === null || chatReport === void 0 ? void 0 : chatReport.currency;
    var _j = chatReport ? (0, TripReservationUtils_1.getTripTotal)(chatReport) : {}, _k = _j.totalDisplaySpend, totalDisplaySpend = _k === void 0 ? 0 : _k, _l = _j.currency, currency = _l === void 0 ? reportCurrency : _l;
    var displayAmount = (0, react_1.useMemo)(function () {
        if (totalDisplaySpend) {
            return (0, CurrencyUtils_1.convertToDisplayString)(totalDisplaySpend, currency);
        }
        return (0, CurrencyUtils_1.convertToDisplayString)(tripTransactions === null || tripTransactions === void 0 ? void 0 : tripTransactions.reduce(function (acc, transaction) { return acc + Math.abs(transaction.amount); }, 0), currency);
    }, [currency, totalDisplaySpend, tripTransactions]);
    var navigateToTrip = function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(chatReportID, undefined, undefined, undefined, undefined, Navigation_1.default.getActiveRoute())); };
    var renderItem = function (_a) {
        var item = _a.item;
        return (<ReservationView reservation={item.reservation} onPress={navigateToTrip}/>);
    };
    return (<OfflineWithFeedback_1.default pendingAction={action === null || action === void 0 ? void 0 : action.pendingAction} shouldDisableOpacity={!!((_e = action.pendingAction) !== null && _e !== void 0 ? _e : action.isOptimisticAction)} needsOffscreenAlphaCompositing>
            <react_native_1.View style={[styles.chatItemMessage, containerStyles]}>
                <Pressable_1.PressableWithoutFeedback onPress={navigateToTrip} onPressIn={function () { return (0, DeviceCapabilities_1.canUseTouchScreen)() && ControlSelection_1.default.block(); }} onPressOut={function () { return ControlSelection_1.default.unblock(); }} onLongPress={function (event) {
            if (!shouldDisplayContextMenu) {
                return;
            }
            (0, ShowContextMenuContext_1.showContextMenuForReport)(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive);
        }} shouldUseHapticsOnLongPress style={[styles.flexRow, styles.justifyContentBetween, styles.reportPreviewBox]} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('iou.viewDetails')}>
                    <react_native_1.View style={[styles.moneyRequestPreviewBox, styles.p4, styles.gap5, isHovered ? styles.reportPreviewBoxHoverBorder : undefined]}>
                        <react_native_1.View style={styles.expenseAndReportPreviewTextContainer}>
                            <react_native_1.View style={styles.reportPreviewAmountSubtitleContainer}>
                                <react_native_1.View style={styles.flexRow}>
                                    <react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                        <Text_1.default style={[styles.textLabelSupporting, styles.lh16]}>
                                            {translate('travel.trip')} • {dateInfo}
                                        </Text_1.default>
                                    </react_native_1.View>
                                </react_native_1.View>
                            </react_native_1.View>
                            <react_native_1.View style={styles.reportPreviewAmountSubtitleContainer}>
                                <react_native_1.View style={styles.flexRow}>
                                    <react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                        <Text_1.default style={styles.textHeadlineH2}>{displayAmount}</Text_1.default>
                                    </react_native_1.View>
                                </react_native_1.View>
                                <react_native_1.View style={styles.flexRow}>
                                    <react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                        <Text_1.default style={[styles.textLabelSupporting, styles.textNormal, styles.lh20]}>{chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportName}</Text_1.default>
                                    </react_native_1.View>
                                </react_native_1.View>
                            </react_native_1.View>
                        </react_native_1.View>
                        <react_native_1.FlatList data={reservationsData} style={styles.gap3} renderItem={renderItem}/>
                        <Button_1.default text={translate('travel.viewTrip')} onPress={navigateToTrip}/>
                    </react_native_1.View>
                </Pressable_1.PressableWithoutFeedback>
            </react_native_1.View>
        </OfflineWithFeedback_1.default>);
}
TripRoomPreview.displayName = 'TripRoomPreview';
exports.default = TripRoomPreview;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var eReceipt_background_svg_1 = require("@assets/images/eReceipt_background.svg");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var ReceiptUtils_1 = require("@libs/ReceiptUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var tryResolveUrlFromApiRoot_1 = require("@libs/tryResolveUrlFromApiRoot");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var ImageSVG_1 = require("./ImageSVG");
var PendingMapView_1 = require("./MapView/PendingMapView");
var ReceiptImage_1 = require("./ReceiptImage");
var ScrollView_1 = require("./ScrollView");
var Text_1 = require("./Text");
function DistanceEReceipt(_a) {
    var _b, _c;
    var transaction = _a.transaction;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var thumbnail = (0, TransactionUtils_1.hasReceipt)(transaction) ? (0, ReceiptUtils_1.getThumbnailAndImageURIs)(transaction).thumbnail : null;
    var _d = (_b = (0, ReportUtils_1.getTransactionDetails)(transaction)) !== null && _b !== void 0 ? _b : {}, transactionAmount = _d.amount, transactionCurrency = _d.currency, transactionMerchant = _d.merchant, transactionDate = _d.created;
    var formattedTransactionAmount = (0, CurrencyUtils_1.convertToDisplayString)(transactionAmount, transactionCurrency);
    var thumbnailSource = (0, tryResolveUrlFromApiRoot_1.default)(thumbnail !== null && thumbnail !== void 0 ? thumbnail : '');
    var waypoints = (0, react_1.useMemo)(function () { var _a, _b; return (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.waypoints) !== null && _b !== void 0 ? _b : {}; }, [(_c = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _c === void 0 ? void 0 : _c.waypoints]);
    var sortedWaypoints = (0, react_1.useMemo)(function () {
        // The waypoint keys are sometimes out of order
        return Object.keys(waypoints)
            .sort(function (keyA, keyB) { return (0, TransactionUtils_1.getWaypointIndex)(keyA) - (0, TransactionUtils_1.getWaypointIndex)(keyB); })
            .map(function (key) {
            var _a;
            return (_a = {}, _a[key] = waypoints[key], _a);
        })
            .reduce(function (result, obj) { return (obj ? Object.assign(result, obj) : result); }, {});
    }, [waypoints]);
    return (<react_native_1.View style={[styles.flex1, styles.alignItemsCenter]}>
            <ScrollView_1.default style={styles.w100} contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <react_native_1.View style={styles.eReceiptPanel}>
                    <ImageSVG_1.default src={eReceipt_background_svg_1.default} style={styles.eReceiptBackground} pointerEvents="none"/>

                    <react_native_1.View style={[styles.moneyRequestViewImage, styles.mh0, styles.mt0, styles.mb5, styles.borderNone]}>
                        {(0, TransactionUtils_1.isFetchingWaypointsFromServer)(transaction) || !thumbnailSource ? (<PendingMapView_1.default />) : (<ReceiptImage_1.default source={thumbnailSource} shouldUseThumbnailImage shouldUseInitialObjectPosition/>)}
                    </react_native_1.View>
                    <react_native_1.View style={[styles.mb10, styles.gap5, styles.ph2, styles.flexColumn, styles.alignItemsCenter]}>
                        {transactionAmount !== null && transactionAmount !== undefined && <Text_1.default style={styles.eReceiptAmount}>{formattedTransactionAmount}</Text_1.default>}
                        <Text_1.default style={styles.eReceiptMerchant}>{transactionMerchant}</Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.mb10, styles.gap5, styles.ph2]}>
                        {Object.entries(sortedWaypoints).map(function (_a) {
            var key = _a[0], waypoint = _a[1];
            var index = (0, TransactionUtils_1.getWaypointIndex)(key);
            var descriptionKey = 'distance.waypointDescription.stop';
            if (index === 0) {
                descriptionKey = 'distance.waypointDescription.start';
            }
            return (<react_native_1.View style={styles.gap1} key={key}>
                                    <Text_1.default style={styles.eReceiptWaypointTitle}>{translate(descriptionKey)}</Text_1.default>
                                    {!!(waypoint === null || waypoint === void 0 ? void 0 : waypoint.name) && <Text_1.default style={styles.eReceiptWaypointAddress}>{waypoint.name}</Text_1.default>}
                                    {!!(waypoint === null || waypoint === void 0 ? void 0 : waypoint.address) && <Text_1.default style={styles.eReceiptGuaranteed}>{waypoint.address}</Text_1.default>}
                                </react_native_1.View>);
        })}
                        <react_native_1.View style={styles.gap1}>
                            <Text_1.default style={styles.eReceiptWaypointTitle}>{translate('common.date')}</Text_1.default>
                            <Text_1.default style={styles.eReceiptWaypointAddress}>{transactionDate}</Text_1.default>
                        </react_native_1.View>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.ph2, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                        <Icon_1.default width={86} height={19.25} src={Expensicons.ExpensifyWordmark}/>

                        <Text_1.default style={styles.eReceiptGuaranteed}>{translate('eReceipt.guaranteed')}</Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>
            </ScrollView_1.default>
        </react_native_1.View>);
}
DistanceEReceipt.displayName = 'DistanceEReceipt';
exports.default = DistanceEReceipt;

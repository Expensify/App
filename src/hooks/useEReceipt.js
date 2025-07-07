"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useEReceipt;
var react_1 = require("react");
var eReceiptBGs = require("@components/Icon/EReceiptBGs");
var MCCIcons = require("@components/Icon/MCCIcons");
var ReportUtils_1 = require("@libs/ReportUtils");
var TripReservationUtils_1 = require("@libs/TripReservationUtils");
var CONST_1 = require("@src/CONST");
var useStyleUtils_1 = require("./useStyleUtils");
var backgroundImages = (_a = {},
    _a[CONST_1.default.ERECEIPT_COLORS.YELLOW] = eReceiptBGs.EReceiptBG_Yellow,
    _a[CONST_1.default.ERECEIPT_COLORS.ICE] = eReceiptBGs.EReceiptBG_Ice,
    _a[CONST_1.default.ERECEIPT_COLORS.BLUE] = eReceiptBGs.EReceiptBG_Blue,
    _a[CONST_1.default.ERECEIPT_COLORS.GREEN] = eReceiptBGs.EReceiptBG_Green,
    _a[CONST_1.default.ERECEIPT_COLORS.TANGERINE] = eReceiptBGs.EReceiptBG_Tangerine,
    _a[CONST_1.default.ERECEIPT_COLORS.PINK] = eReceiptBGs.EReceiptBG_Pink,
    _a);
function useEReceipt(transactionData, fileExtension, isReceiptThumbnail) {
    var StyleUtils = (0, useStyleUtils_1.default)();
    var colorCode = isReceiptThumbnail ? StyleUtils.getFileExtensionColorCode(fileExtension) : StyleUtils.getEReceiptColorCode(transactionData);
    var colorStyles = StyleUtils.getEReceiptColorStyles(colorCode);
    var primaryColor = colorStyles === null || colorStyles === void 0 ? void 0 : colorStyles.backgroundColor;
    var secondaryColor = colorStyles === null || colorStyles === void 0 ? void 0 : colorStyles.color;
    var titleColor = colorStyles === null || colorStyles === void 0 ? void 0 : colorStyles.titleColor;
    var transactionDetails = (0, ReportUtils_1.getTransactionDetails)(transactionData);
    var transactionMCCGroup = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.mccGroup;
    var MCCIcon = transactionMCCGroup ? MCCIcons["".concat(transactionMCCGroup)] : undefined;
    var tripIcon = (0, TripReservationUtils_1.getTripEReceiptIcon)(transactionData);
    var backgroundImage = (0, react_1.useMemo)(function () { return backgroundImages[colorCode]; }, [colorCode]);
    return {
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
        titleColor: titleColor,
        MCCIcon: MCCIcon,
        tripIcon: tripIcon,
        backgroundImage: backgroundImage,
    };
}

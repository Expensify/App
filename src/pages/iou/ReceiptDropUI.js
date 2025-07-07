"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var receipt_upload_svg_1 = require("@assets/images/receipt-upload.svg");
var Consumer_1 = require("@components/DragAndDrop/Consumer");
var ImageSVG_1 = require("@components/ImageSVG");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function ReceiptDropUI(_a) {
    var onDrop = _a.onDrop, receiptImageTopPosition = _a.receiptImageTopPosition;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<Consumer_1.default onDrop={onDrop}>
            <react_native_1.View style={[styles.fileDropOverlay, styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <react_native_1.View style={receiptImageTopPosition ? styles.fileUploadImageWrapper(receiptImageTopPosition) : undefined}>
                    <ImageSVG_1.default src={receipt_upload_svg_1.default} contentFit="contain" width={CONST_1.default.RECEIPT.ICON_SIZE} height={CONST_1.default.RECEIPT.ICON_SIZE}/>
                    <Text_1.default style={[styles.textFileUpload]}>{translate('common.dropTitle')}</Text_1.default>
                    <Text_1.default style={[styles.subTextFileUpload]}>{translate('common.dropMessage')}</Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
        </Consumer_1.default>);
}
ReceiptDropUI.displayName = 'ReceiptDropUI';
exports.default = ReceiptDropUI;

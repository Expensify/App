"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Consumer_1 = require("@components/DragAndDrop/Consumer");
var Expensicons = require("@components/Icon/Expensicons");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DropZoneUI_1 = require("./DropZoneUI");
var DropZoneWrapper_1 = require("./DropZoneWrapper");
function DualDropZone(_a) {
    var isEditing = _a.isEditing, onAttachmentDrop = _a.onAttachmentDrop, onReceiptDrop = _a.onReceiptDrop;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _b.shouldUseNarrowLayout, isMediumScreenWidth = _b.isMediumScreenWidth;
    var shouldStackVertically = shouldUseNarrowLayout || isMediumScreenWidth;
    return (<Consumer_1.default>
            <react_native_1.View style={[shouldStackVertically ? styles.flexColumn : styles.flexRow, styles.w100, styles.h100]}>
                <DropZoneWrapper_1.default onDrop={onAttachmentDrop}>
                    {function (_a) {
            var isDraggingOver = _a.isDraggingOver;
            return (<DropZoneUI_1.default icon={Expensicons.MessageInABottle} dropTitle={translate('dropzone.addAttachments')} dropStyles={styles.attachmentDropOverlay(isDraggingOver)} dropTextStyles={styles.attachmentDropText} dropInnerWrapperStyles={styles.attachmentDropInnerWrapper(isDraggingOver)} dropWrapperStyles={shouldStackVertically ? styles.pb0 : styles.pr0}/>);
        }}
                </DropZoneWrapper_1.default>
                <DropZoneWrapper_1.default onDrop={onReceiptDrop}>
                    {function (_a) {
            var isDraggingOver = _a.isDraggingOver;
            return (<DropZoneUI_1.default icon={isEditing ? Expensicons.ReplaceReceipt : Expensicons.SmartScan} dropTitle={translate(isEditing ? 'dropzone.replaceReceipt' : 'dropzone.scanReceipts')} dropStyles={styles.receiptDropOverlay(isDraggingOver)} dropTextStyles={styles.receiptDropText} dropInnerWrapperStyles={styles.receiptDropInnerWrapper(isDraggingOver)}/>);
        }}
                </DropZoneWrapper_1.default>
            </react_native_1.View>
        </Consumer_1.default>);
}
exports.default = DualDropZone;

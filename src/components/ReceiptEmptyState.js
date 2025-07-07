"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PressableWithoutFeedback_1 = require("./Pressable/PressableWithoutFeedback");
// Returns an SVG icon indicating that the user should attach a receipt
function ReceiptEmptyState(_a) {
    var onPress = _a.onPress, _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.isThumbnail, isThumbnail = _c === void 0 ? false : _c, _d = _a.isInMoneyRequestView, isInMoneyRequestView = _d === void 0 ? false : _d, _e = _a.shouldUseFullHeight, shouldUseFullHeight = _e === void 0 ? false : _e, style = _a.style;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var Wrapper = onPress ? PressableWithoutFeedback_1.default : react_native_1.View;
    var containerStyle = [
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        styles.moneyRequestViewImage,
        isThumbnail && !isInMoneyRequestView ? styles.moneyRequestAttachReceiptThumbnail : styles.moneyRequestAttachReceipt,
        shouldUseFullHeight && styles.receiptEmptyStateFullHeight,
        style,
    ];
    return (<Wrapper accessibilityRole="imagebutton" accessibilityLabel={translate('receipt.upload')} onPress={onPress} disabled={disabled} disabledStyle={styles.cursorDefault} style={containerStyle}>
            <react_native_1.View>
                <Icon_1.default fill={theme.border} src={Expensicons.Receipt} width={variables_1.default.eReceiptEmptyIconWidth} height={variables_1.default.eReceiptEmptyIconWidth}/>
                {!isThumbnail && (<Icon_1.default src={Expensicons.ReceiptPlaceholderPlus} width={variables_1.default.avatarSizeSmall} height={variables_1.default.avatarSizeSmall} additionalStyles={styles.moneyRequestAttachReceiptThumbnailIcon}/>)}
            </react_native_1.View>
        </Wrapper>);
}
ReceiptEmptyState.displayName = 'ReceiptEmptyState';
exports.default = ReceiptEmptyState;

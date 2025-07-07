"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AttachmentView_1 = require("@components/Attachments/AttachmentView");
var Button_1 = require("@components/Button");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var SafeAreaConsumer_1 = require("@components/SafeAreaConsumer");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var AttachmentModalContext_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalContext");
var CONST_1 = require("@src/CONST");
function CarouselItem(_a) {
    var _b;
    var item = _a.item, onPress = _a.onPress, isFocused = _a.isFocused, isModalHovered = _a.isModalHovered, reportID = _a.reportID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isAttachmentHidden = (0, react_1.useContext)(AttachmentModalContext_1.default).isAttachmentHidden;
    var _c = (0, react_1.useState)(function () { var _a; return (_a = (item.reportActionID && isAttachmentHidden(item.reportActionID))) !== null && _a !== void 0 ? _a : item.hasBeenFlagged; }), isHidden = _c[0], setIsHidden = _c[1];
    var renderButton = function (style) {
        var _a;
        return (<Button_1.default small style={style} onPress={function () { return setIsHidden(!isHidden); }} testID="moderationButton">
            <Text_1.default style={[styles.buttonSmallText, styles.userSelectNone]} dataSet={_a = {}, _a[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _a}>
                {isHidden ? translate('moderation.revealMessage') : translate('moderation.hideMessage')}
            </Text_1.default>
        </Button_1.default>);
    };
    if (isHidden) {
        var children = (<>
                <Text_1.default style={[styles.textLabelSupporting, styles.textAlignCenter, styles.lh20]}>{translate('moderation.flaggedContent')}</Text_1.default>
                {renderButton([styles.mt2])}
            </>);
        return onPress ? (<PressableWithoutFeedback_1.default style={[styles.attachmentRevealButtonContainer]} onPress={onPress} accessibilityRole={CONST_1.default.ROLE.BUTTON} 
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        accessibilityLabel={((_b = item.file) === null || _b === void 0 ? void 0 : _b.name) || translate('attachmentView.unknownFilename')}>
                {children}
            </PressableWithoutFeedback_1.default>) : (<react_native_1.View style={[styles.attachmentRevealButtonContainer]}>{children}</react_native_1.View>);
    }
    return (<react_native_1.View style={[styles.flex1]}>
            <react_native_1.View style={[styles.imageModalImageCenterContainer]}>
                <AttachmentView_1.default source={item.source} previewSource={item.previewSource} file={item.file} isAuthTokenRequired={item.isAuthTokenRequired} onPress={onPress} transactionID={item.transactionID} reportActionID={item.reportActionID} isHovered={isModalHovered} isFocused={isFocused} duration={item.duration} fallbackSource={Expensicons.AttachmentNotFound} reportID={reportID}/>
            </react_native_1.View>

            {!!item.hasBeenFlagged && (<SafeAreaConsumer_1.default>
                    {function (_a) {
            var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
            return <react_native_1.View style={[styles.appBG, safeAreaPaddingBottomStyle]}>{renderButton([styles.m4, styles.alignSelfCenter])}</react_native_1.View>;
        }}
                </SafeAreaConsumer_1.default>)}
        </react_native_1.View>);
}
CarouselItem.displayName = 'CarouselItem';
exports.default = CarouselItem;

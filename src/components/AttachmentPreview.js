"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var expo_av_1 = require("expo-av");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var AttachmentView_1 = require("./Attachments/AttachmentView");
var DefaultAttachmentView_1 = require("./Attachments/AttachmentView/DefaultAttachmentView");
var Icon_1 = require("./Icon");
var Expensicons_1 = require("./Icon/Expensicons");
var Image_1 = require("./Image");
var PDFThumbnail_1 = require("./PDFThumbnail");
var Pressable_1 = require("./Pressable");
function AttachmentPreview(_a) {
    var _b;
    var source = _a.source, _c = _a.aspectRatio, aspectRatio = _c === void 0 ? 1 : _c, onPress = _a.onPress, onLoadError = _a.onLoadError;
    var styles = (0, useThemeStyles_1.default)();
    var fileName = (_b = source.split('/').pop()) !== null && _b !== void 0 ? _b : undefined;
    var fillStyle = aspectRatio < 1 ? styles.h100 : styles.w100;
    var _d = (0, react_1.useState)(false), isEncryptedPDF = _d[0], setIsEncryptedPDF = _d[1];
    if (typeof source === 'string' && expensify_common_1.Str.isVideo(source)) {
        return (<Pressable_1.PressableWithFeedback accessibilityRole="button" style={[fillStyle, styles.br2, styles.overflowHidden, styles.alignSelfStart, { aspectRatio: aspectRatio }]} onPress={onPress} accessible accessibilityLabel="Attachment Thumbnail">
                <expo_av_1.Video style={[styles.w100, styles.h100]} source={{
                uri: source,
            }} shouldPlay={false} useNativeControls={false} resizeMode={expo_av_1.ResizeMode.CONTAIN} isLooping={false} onError={onLoadError}/>
                <react_native_1.View style={[styles.h100, styles.w100, styles.pAbsolute, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <react_native_1.View style={styles.videoThumbnailPlayButton}>
                        <Icon_1.default src={Expensicons_1.Play} fill="white" width={variables_1.default.iconSizeXLarge} height={variables_1.default.iconSizeXLarge}/>
                    </react_native_1.View>
                </react_native_1.View>
            </Pressable_1.PressableWithFeedback>);
    }
    var isFileImage = (0, AttachmentView_1.checkIsFileImage)(source, fileName);
    if (isFileImage) {
        return (<Pressable_1.PressableWithFeedback accessibilityRole="button" style={[styles.alignItemsStart, { aspectRatio: 1 }]} onPress={onPress} accessible accessibilityLabel="Image Thumbnail">
                <react_native_1.View style={[fillStyle, styles.br4, styles.overflowHidden, { aspectRatio: aspectRatio }]}>
                    <Image_1.default source={{ uri: source }} style={[[styles.w100, styles.h100], styles.overflowHidden]}/>
                </react_native_1.View>
            </Pressable_1.PressableWithFeedback>);
    }
    if (typeof source === 'string' && expensify_common_1.Str.isPDF(source) && !isEncryptedPDF) {
        return (<Pressable_1.PressableWithFeedback accessibilityRole="button" style={[styles.justifyContentStart, { aspectRatio: 1 }]} onPress={onPress} accessible accessibilityLabel="PDF Thumbnail">
                <PDFThumbnail_1.default fitPolicy={1} previewSourceURL={source} style={[styles.br4]} onLoadError={onLoadError} onPassword={function () { return setIsEncryptedPDF(true); }}/>
            </Pressable_1.PressableWithFeedback>);
    }
    return <DefaultAttachmentView_1.default fileName={fileName}/>;
}
AttachmentPreview.displayName = 'AttachmentPreview';
exports.default = AttachmentPreview;

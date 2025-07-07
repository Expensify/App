"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable react/no-array-index-key */
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_svg_1 = require("react-native-svg");
var ImageBehaviorContextProvider_1 = require("@components/Image/ImageBehaviorContextProvider");
var Text_1 = require("@components/Text");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var ReportActionItemImage_1 = require("./ReportActionItemImage");
/**
 * This component displays a row of images in a report action item like a card, such
 * as report previews or expense previews which contain receipt images. The maximum of images
 * shown in this row is dictated by the size prop, which, if not passed, is just the number of images.
 * Otherwise, if size is passed and the number of images is over size, we show a small overlay on the
 * last image of how many additional images there are. If passed, total prop can be used to change how this
 * additional number when subtracted from size.
 */
function ReportActionItemImages(_a) {
    var images = _a.images, size = _a.size, total = _a.total, _b = _a.isHovered, isHovered = _b === void 0 ? false : _b, onPress = _a.onPress, _c = _a.shouldUseAspectRatio, shouldUseAspectRatio = _c === void 0 ? false : _c;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    // Calculate the number of images to be shown, limited by the value of 'size' (if defined)
    // or the total number of images.
    var numberOfShownImages = Math.min(size !== null && size !== void 0 ? size : images.length, images.length);
    var shownImages = images.slice(0, numberOfShownImages);
    var remaining = (total !== null && total !== void 0 ? total : images.length) - numberOfShownImages;
    var MAX_REMAINING = 9;
    // The height varies depending on the number of images we are displaying.
    var layoutStyle = [];
    if (shouldUseAspectRatio) {
        layoutStyle.push(styles.receiptPreviewAspectRatio);
    }
    else if (numberOfShownImages === 1) {
        layoutStyle.push(StyleUtils.getMaximumHeight(variables_1.default.reportActionImagesSingleImageHeight), StyleUtils.getMinimumHeight(variables_1.default.reportActionImagesSingleImageHeight));
    }
    else if (numberOfShownImages === 2) {
        layoutStyle.push(StyleUtils.getMaximumHeight(variables_1.default.reportActionImagesDoubleImageHeight), StyleUtils.getMinimumHeight(variables_1.default.reportActionImagesDoubleImageHeight));
    }
    else if (numberOfShownImages > 2) {
        layoutStyle.push(StyleUtils.getMaximumHeight(variables_1.default.reportActionImagesMultipleImageHeight), StyleUtils.getMinimumHeight(variables_1.default.reportActionImagesMultipleImageHeight));
    }
    var hoverStyle = isHovered ? styles.reportPreviewBoxHoverBorder : undefined;
    var triangleWidth = variables_1.default.reportActionItemImagesMoreCornerTriangleWidth;
    return (<react_native_1.View style={styles.reportActionItemImagesContainer}>
            <react_native_1.View style={__spreadArray([styles.reportActionItemImages, hoverStyle], layoutStyle, true)}>
                {shownImages.map(function (_a, index) {
            var thumbnail = _a.thumbnail, isThumbnail = _a.isThumbnail, image = _a.image, isEmptyReceipt = _a.isEmptyReceipt, transaction = _a.transaction, isLocalFile = _a.isLocalFile, fileExtension = _a.fileExtension, filename = _a.filename;
            // Show a border to separate multiple images. Shown to the right for each except the last.
            var shouldShowBorder = shownImages.length > 1 && index < shownImages.length - 1;
            var borderStyle = shouldShowBorder ? styles.reportActionItemImageBorder : {};
            return (<ImageBehaviorContextProvider_1.ImageBehaviorContextProvider key={"".concat(index, "-").concat(image)} shouldSetAspectRatioInStyle={numberOfShownImages === 1 ? true : expensify_common_1.Str.isPDF(filename !== null && filename !== void 0 ? filename : '')}>
                            <react_native_1.View style={[styles.reportActionItemImage, borderStyle, hoverStyle]}>
                                <ReportActionItemImage_1.default thumbnail={thumbnail} fileExtension={fileExtension} image={image} isLocalFile={isLocalFile} isEmptyReceipt={isEmptyReceipt} filename={filename} transaction={transaction} isThumbnail={isThumbnail} isSingleImage={numberOfShownImages === 1} shouldMapHaveBorderRadius={false} onPress={onPress} shouldUseFullHeight={shouldUseAspectRatio}/>
                            </react_native_1.View>
                        </ImageBehaviorContextProvider_1.ImageBehaviorContextProvider>);
        })}
            </react_native_1.View>
            {remaining > 0 && (<react_native_1.View style={[styles.reportActionItemImagesMoreContainer]}>
                    <react_native_1.View style={[styles.reportActionItemImagesMore, isHovered ? styles.reportActionItemImagesMoreHovered : {}]}/>
                    <react_native_svg_1.Svg height={triangleWidth} width={triangleWidth} style={styles.reportActionItemImagesMoreCornerTriangle}>
                        <react_native_svg_1.Polygon points={"".concat(triangleWidth, ",0 ").concat(triangleWidth, ",").concat(triangleWidth, " 0,").concat(triangleWidth)} fill={isHovered ? theme.border : theme.cardBG}/>
                    </react_native_svg_1.Svg>
                    <Text_1.default style={[styles.reportActionItemImagesMoreText, styles.textStrong]}>{remaining > MAX_REMAINING ? "".concat(MAX_REMAINING, "+") : "+".concat(remaining)}</Text_1.default>
                </react_native_1.View>)}
        </react_native_1.View>);
}
ReportActionItemImages.displayName = 'ReportActionItemImages';
exports.default = ReportActionItemImages;

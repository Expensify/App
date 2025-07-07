"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
function getBottomSuggestionPadding(bottom) {
    var height = react_native_1.Dimensions.get('window').height;
    var basePadding = 30;
    // Calculate what percentage of the screen height the bottom position represents
    var bottomPercentageToHeight = (bottom / height) * 100;
    // Reference values for interpolation
    var referenceHeightMin = 900;
    var referencePaddingMin = -10;
    var referenceHeightMax = 1000;
    var referencePaddingMax = -44;
    // If the bottom position is more than 7% of the screen, the value is too big and we need adjust the padding
    if (bottomPercentageToHeight > 7) {
        // Calculate the rate of change between reference points
        var paddingRate = (referencePaddingMax - referencePaddingMin) / (referenceHeightMax - referenceHeightMin);
        // Interpolate the padding value based on the current screen height
        var padding = referencePaddingMin + (height - referenceHeightMin) * paddingRate;
        // Clamp the padding value between -60 and -5 to prevent extreme values
        return Math.round(Math.max(-60, Math.min(-5, padding)));
    }
    return basePadding;
}
exports.default = getBottomSuggestionPadding;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getTripIllustrationStyle;
// Styling lottie animations for the Lightbulb component requires different margin values depending on the platform.
function getTripIllustrationStyle() {
    return {
        marginTop: 16,
        marginBottom: -16,
    };
}

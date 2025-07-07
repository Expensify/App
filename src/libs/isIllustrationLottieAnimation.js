"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isIllustrationLottieAnimation(illustration) {
    if (typeof illustration === 'number' || !illustration) {
        return false;
    }
    return 'file' in illustration && 'w' in illustration && 'h' in illustration;
}
exports.default = isIllustrationLottieAnimation;

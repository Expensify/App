
exports.__esModule = true;
const Browser = require('@libs/Browser');
const CONST_1 = require('@src/CONST');

function getPlatform(shouldMobileWebBeDistinctFromWeb) {
    if (shouldMobileWebBeDistinctFromWeb === void 0) {
        shouldMobileWebBeDistinctFromWeb = false;
    }
    if (shouldMobileWebBeDistinctFromWeb && Browser.isMobile()) {
        return CONST_1['default'].PLATFORM.MOBILEWEB;
    }
    return CONST_1['default'].PLATFORM.WEB;
}
exports['default'] = getPlatform;

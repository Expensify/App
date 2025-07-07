"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User_1 = require("@libs/actions/User");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
function useDismissedReferralBanners(_a) {
    var _b;
    var referralContentType = _a.referralContentType;
    var dismissedReferralBanners = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_DISMISSED_REFERRAL_BANNERS)[0];
    var isDismissed = (_b = dismissedReferralBanners === null || dismissedReferralBanners === void 0 ? void 0 : dismissedReferralBanners[referralContentType]) !== null && _b !== void 0 ? _b : false;
    var setAsDismissed = function () {
        if (!referralContentType) {
            return;
        }
        // Set the banner as dismissed
        (0, User_1.dismissReferralBanner)(referralContentType);
    };
    return { isDismissed: isDismissed, setAsDismissed: setAsDismissed };
}
exports.default = useDismissedReferralBanners;

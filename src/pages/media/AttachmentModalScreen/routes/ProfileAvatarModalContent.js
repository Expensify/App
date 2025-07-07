"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var PersonalDetails_1 = require("@libs/actions/PersonalDetails");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var UserUtils_1 = require("@libs/UserUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var AttachmentModalContainer_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalContainer");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ProfileAvatarModalContent(_a) {
    var _b;
    var navigation = _a.navigation, route = _a.route;
    var _c = route.params.accountID, accountID = _c === void 0 ? CONST_1.default.DEFAULT_NUMBER_ID : _c;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var personalDetail = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID];
    var personalDetailsMetadata = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_METADATA, { canBeMissing: false })[0];
    var avatarURL = (_b = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.avatar) !== null && _b !== void 0 ? _b : '';
    var displayName = (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(personalDetail);
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { initialValue: true, canBeMissing: true })[0];
    (0, react_1.useEffect)(function () {
        if (!(0, ValidationUtils_1.isValidAccountRoute)(accountID)) {
            return;
        }
        (0, PersonalDetails_1.openPublicProfilePage)(accountID);
    }, [accountID]);
    var contentProps = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        return ({
            source: (0, UserUtils_1.getFullSizeAvatar)(avatarURL, accountID),
            isLoading: !!((_b = (_a = personalDetailsMetadata === null || personalDetailsMetadata === void 0 ? void 0 : personalDetailsMetadata[accountID]) === null || _a === void 0 ? void 0 : _a.isLoading) !== null && _b !== void 0 ? _b : (isLoadingApp && !Object.keys(personalDetail !== null && personalDetail !== void 0 ? personalDetail : {}).length)),
            headerTitle: (0, LocalePhoneNumber_1.formatPhoneNumber)(displayName),
            originalFileName: (_c = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.originalFileName) !== null && _c !== void 0 ? _c : '',
            shouldShowNotFoundPage: !avatarURL,
            maybeIcon: true,
        });
    }, [accountID, avatarURL, displayName, isLoadingApp, personalDetail, personalDetailsMetadata]);
    return (<AttachmentModalContainer_1.default navigation={navigation} contentProps={contentProps}/>);
}
ProfileAvatarModalContent.displayName = 'ProfileAvatarModalContent';
exports.default = ProfileAvatarModalContent;

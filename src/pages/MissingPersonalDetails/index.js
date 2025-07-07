"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var MissingPersonalDetailsContent_1 = require("./MissingPersonalDetailsContent");
function MissingPersonalDetails() {
    var _a = (0, useOnyx_1.default)(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS), privatePersonalDetails = _a[0], privatePersonalDetailsMetadata = _a[1];
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.PERSONAL_DETAILS_FORM_DRAFT), draftValues = _b[0], draftValuesMetadata = _b[1];
    var isLoading = (0, isLoadingOnyxValue_1.default)(privatePersonalDetailsMetadata, draftValuesMetadata);
    if (isLoading) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<MissingPersonalDetailsContent_1.default privatePersonalDetails={privatePersonalDetails} draftValues={draftValues}/>);
}
MissingPersonalDetails.displayName = 'MissingPersonalDetails';
exports.default = MissingPersonalDetails;

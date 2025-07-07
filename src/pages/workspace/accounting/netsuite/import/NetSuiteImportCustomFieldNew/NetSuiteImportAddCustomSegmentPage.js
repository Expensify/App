"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var NetSuiteImportAddCustomSegmentContent_1 = require("./NetSuiteImportAddCustomSegmentContent");
function NetSuiteImportAddCustomSegmentPage(_a) {
    var policy = _a.policy;
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM_DRAFT), draftValues = _b[0], draftValuesMetadata = _b[1];
    var isLoading = (0, isLoadingOnyxValue_1.default)(draftValuesMetadata);
    if (isLoading) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<NetSuiteImportAddCustomSegmentContent_1.default policy={policy} draftValues={draftValues}/>);
}
NetSuiteImportAddCustomSegmentPage.displayName = 'NetSuiteImportAddCustomSegmentPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteImportAddCustomSegmentPage);

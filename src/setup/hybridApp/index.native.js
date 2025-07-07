"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var Navigation_1 = require("@navigation/Navigation");
var Report_1 = require("@userActions/Report");
var CONFIG_1 = require("@src/CONFIG");
if (CONFIG_1.default.IS_HYBRID_APP) {
    react_native_1.Linking.addEventListener('url', function (state) {
        var parsedUrl = Navigation_1.default.parseHybridAppUrl(state.url);
        (0, Report_1.openReportFromDeepLink)(parsedUrl);
    });
}

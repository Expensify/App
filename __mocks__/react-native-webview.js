"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('react-native-webview', function () {
    var View = require('react-native').View;
    return {
        WebView: function () { return View; },
    };
});

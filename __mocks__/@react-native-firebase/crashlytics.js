"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// <App> uses <ErrorBoundary> and we need to mock the imported crashlytics module
// due to an error that happens otherwise https://github.com/invertase/react-native-firebase/issues/2475
var crashlyticsMock = function () { return ({
    log: jest.fn(),
    recordError: jest.fn(),
    setCrashlyticsCollectionEnabled: jest.fn(),
    setUserId: jest.fn(),
}); };
exports.default = crashlyticsMock;

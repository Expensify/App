"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
require("react-native");
// Note: `react-test-renderer` renderer must be required after react-native.
var react_test_renderer_1 = require("react-test-renderer");
var App_1 = require("@src/App");
// Needed for: https://stackoverflow.com/questions/76903168/mocking-libraries-in-jest
jest.mock('react-native/Libraries/LogBox/LogBox', function () { return ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        ignoreLogs: jest.fn(),
        ignoreAllLogs: jest.fn(),
    },
}); });
describe('AppComponent', function () {
    it('renders correctly', function () {
        react_test_renderer_1.default.create(<App_1.default />);
    });
});

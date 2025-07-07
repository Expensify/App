"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var reassure_1 = require("reassure");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var SearchAutocompleteInput_1 = require("@components/Search/SearchAutocompleteInput");
var SearchRouter_1 = require("@components/Search/SearchRouter/SearchRouter");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var ComposeProviders_1 = require("@src/components/ComposeProviders");
var OnyxProvider_1 = require("@src/components/OnyxProvider");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var createCollection_1 = require("../utils/collections/createCollection");
var personalDetails_1 = require("../utils/collections/personalDetails");
var reports_1 = require("../utils/collections/reports");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../utils/wrapOnyxWithWaitForBatchedUpdates");
jest.mock('lodash/debounce', function () {
    return jest.fn(function (fn) {
        // eslint-disable-next-line no-param-reassign
        fn.cancel = jest.fn();
        return fn;
    });
});
jest.mock('@src/libs/Log');
jest.mock('@src/libs/API', function () { return ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}); });
jest.mock('@src/libs/Navigation/Navigation', function () { return ({
    dismissModalWithReport: jest.fn(),
    getTopmostReportId: jest.fn(),
    isNavigationReady: jest.fn(function () { return Promise.resolve(); }),
    isDisplayedInModal: jest.fn(function () { return false; }),
}); });
jest.mock('@react-navigation/native', function () {
    var actualNav = jest.requireActual('@react-navigation/native');
    return __assign(__assign({}, actualNav), { useFocusEffect: jest.fn(), useIsFocused: function () { return true; }, useRoute: function () { return jest.fn(); }, usePreventRemove: function () { return jest.fn(); }, useNavigation: function () { return ({
            navigate: jest.fn(),
            addListener: function () { return jest.fn(); },
        }); }, createNavigationContainerRef: function () { return ({
            addListener: function () { return jest.fn(); },
            removeListener: function () { return jest.fn(); },
            isReady: function () { return jest.fn(); },
            getCurrentRoute: function () { return jest.fn(); },
            getState: function () { return jest.fn(); },
        }); }, useNavigationState: function () { return ({
            routes: [],
        }); } });
});
jest.mock('@src/components/ConfirmedRoute.tsx');
var getMockedReports = function (length) {
    if (length === void 0) { length = 100; }
    return (0, createCollection_1.default)(function (item) { return "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(item.reportID); }, function (index) { return (0, reports_1.createRandomReport)(index); }, length);
};
var getMockedPersonalDetails = function (length) {
    if (length === void 0) { length = 100; }
    return (0, createCollection_1.default)(function (item) { return item.accountID; }, function (index) { return (0, personalDetails_1.default)(index); }, length);
};
var mockedReports = getMockedReports(600);
var mockedBetas = Object.values(CONST_1.default.BETAS);
var mockedPersonalDetails = getMockedPersonalDetails(100);
var mockedOptions = (0, OptionsListUtils_1.createOptionList)(mockedPersonalDetails, mockedReports);
beforeAll(function () {
    return react_native_onyx_1.default.init({
        keys: ONYXKEYS_1.default,
        evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT],
    });
});
// Initialize the network key for OfflineWithFeedback
beforeEach(function () {
    global.fetch = TestHelper.getGlobalFetchMock();
    (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: false });
});
// Clear out Onyx after each test so that each test starts with a clean state
afterEach(function () {
    react_native_onyx_1.default.clear();
});
var mockOnClose = jest.fn();
function SearchAutocompleteInputWrapper() {
    var _a = react_1.default.useState(''), value = _a[0], setValue = _a[1];
    return (<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider]}>
            <SearchAutocompleteInput_1.default value={value} onSearchQueryChange={function (searchTerm) { return setValue(searchTerm); }} isFullWidth={false} substitutionMap={CONST_1.default.EMPTY_OBJECT}/>
        </ComposeProviders_1.default>);
}
function SearchRouterWrapperWithCachedOptions() {
    return (<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider]}>
            <OptionListContextProvider_1.OptionsListContext.Provider value={(0, react_1.useMemo)(function () { return ({ options: mockedOptions, initializeOptions: function () { }, resetOptions: function () { }, areOptionsInitialized: true }); }, [])}>
                <SearchRouter_1.default onRouterClose={mockOnClose}/>
            </OptionListContextProvider_1.OptionsListContext.Provider>
        </ComposeProviders_1.default>);
}
test('[SearchRouter] should render list with cached options', function () { return __awaiter(void 0, void 0, void 0, function () {
    var scenario;
    return __generator(this, function (_a) {
        scenario = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_1.screen.findByTestId('SearchRouter')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        return [2 /*return*/, (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign(__assign({}, mockedReports), (_a = {}, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = mockedPersonalDetails, _a[ONYXKEYS_1.default.BETAS] = mockedBetas, _a[ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS] = true, _a)));
            })
                .then(function () { return (0, reassure_1.measureRenders)(<SearchRouterWrapperWithCachedOptions />, { scenario: scenario }); })];
    });
}); });
test('[SearchRouter] should react to text input changes', function () { return __awaiter(void 0, void 0, void 0, function () {
    var scenario;
    return __generator(this, function (_a) {
        scenario = function () { return __awaiter(void 0, void 0, void 0, function () {
            var input;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_1.screen.findByTestId('search-autocomplete-text-input')];
                    case 1:
                        input = _a.sent();
                        react_native_1.fireEvent.changeText(input, 'Email Four');
                        react_native_1.fireEvent.changeText(input, 'Report');
                        react_native_1.fireEvent.changeText(input, 'Email Five');
                        return [2 /*return*/];
                }
            });
        }); };
        return [2 /*return*/, (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign(__assign({}, mockedReports), (_a = {}, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = mockedPersonalDetails, _a[ONYXKEYS_1.default.BETAS] = mockedBetas, _a[ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS] = true, _a)));
            })
                .then(function () { return (0, reassure_1.measureRenders)(<SearchAutocompleteInputWrapper />, { scenario: scenario }); })];
    });
}); });

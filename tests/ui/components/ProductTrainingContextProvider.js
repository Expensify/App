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
var ProductTrainingContext_1 = require("@components/ProductTrainingContext");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var DateUtils_1 = require("@libs/DateUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var TestHelper = require("../../utils/TestHelper");
var waitForBatchedUpdatesWithAct_1 = require("../../utils/waitForBatchedUpdatesWithAct");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../../utils/wrapOnyxWithWaitForBatchedUpdates");
jest.mock('@hooks/useResponsiveLayout', function () { return ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
}); });
// Mock Fullstory library dependency
jest.mock('@libs/Fullstory', function () { return ({
    default: {
        consentAndIdentify: jest.fn(),
    },
    parseFSAttributes: jest.fn(),
}); });
var DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE = {
    shouldUseNarrowLayout: true,
    isSmallScreenWidth: true,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isSmallScreen: false,
    onboardingIsMediumOrLargerScreenWidth: false,
    isExtraLargeScreenWidth: false,
};
var TEST_USER_ACCOUNT_ID = 1;
var TEST_USER_LOGIN = 'test@test.com';
var wrapper = function (_a) {
    var children = _a.children;
    return <ProductTrainingContext_1.ProductTrainingContextProvider>{children}</ProductTrainingContext_1.ProductTrainingContextProvider>;
};
// A simple component that calls useProductTrainingContext and sets its result into the ref.
// Used in cases where using renderHook is not possible, for example, when we need to share the same instance of the context.
var ProductTraining = (0, react_1.forwardRef)(function (_a, ref) {
    var tooltipName = _a.tooltipName, shouldShow = _a.shouldShow;
    var result = (0, ProductTrainingContext_1.useProductTrainingContext)(tooltipName, shouldShow);
    (0, react_1.useImperativeHandle)(ref, function () { return result; });
    return null;
});
var signUpWithTestUser = function () {
    TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
};
describe('ProductTrainingContextProvider', function () {
    beforeAll(function () {
        // Initialize Onyx
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
        return (0, waitForBatchedUpdatesWithAct_1.default)();
    });
    beforeEach(function () {
        // Set up test environment before each test
        (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: false });
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.IS_LOADING_APP, false);
        signUpWithTestUser();
    });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Clean up test environment after each test
                return [4 /*yield*/, react_native_onyx_1.default.clear()];
                case 1:
                    // Clean up test environment after each test
                    _a.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    var mockUseResponsiveLayout = useResponsiveLayout_1.default;
    mockUseResponsiveLayout.mockReturnValue(__assign(__assign({}, DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE), { shouldUseNarrowLayout: false }));
    describe('Basic Tooltip Registration', function () {
        it('should not register tooltips when app is loading', function () { return __awaiter(void 0, void 0, void 0, function () {
            var testTooltip, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // When app is loading
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.IS_LOADING_APP, true);
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        _a.sent();
                        testTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP;
                        result = (0, react_native_1.renderHook)(function () { return (0, ProductTrainingContext_1.useProductTrainingContext)(testTooltip); }, { wrapper: wrapper }).result;
                        // Then tooltip should not show
                        expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not register tooltips when onboarding is not completed', function () { return __awaiter(void 0, void 0, void 0, function () {
            var testTooltip, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // When onboarding is not completed
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { hasCompletedGuidedSetupFlow: false });
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        _a.sent();
                        testTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP;
                        result = (0, react_native_1.renderHook)(function () { return (0, ProductTrainingContext_1.useProductTrainingContext)(testTooltip); }, { wrapper: wrapper }).result;
                        // Then tooltip should not show
                        expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should register tooltips when onboarding is completed and user is not migrated', function () { return __awaiter(void 0, void 0, void 0, function () {
            var testTooltip, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // When onboarding is completed
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { hasCompletedGuidedSetupFlow: true });
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        _a.sent();
                        testTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP;
                        result = (0, react_native_1.renderHook)(function () { return (0, ProductTrainingContext_1.useProductTrainingContext)(testTooltip); }, { wrapper: wrapper }).result;
                        // Then tooltip should show
                        expect(result.current.shouldShowProductTrainingTooltip).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should keep tooltip visible when another tooltip with shouldShow=false is unmounted', function () { return __awaiter(void 0, void 0, void 0, function () {
            var testTooltip, ref, rerender;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        testTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP;
                        ref = (0, react_1.createRef)();
                        rerender = (0, react_native_1.render)(wrapper({
                            children: (<>
                            <ProductTraining ref={ref} tooltipName={testTooltip} shouldShow/>
                            <ProductTraining tooltipName={testTooltip} shouldShow={false}/>
                        </>),
                        })).rerender;
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        _c.sent();
                        // Then tooltip should be shown
                        expect((_a = ref.current) === null || _a === void 0 ? void 0 : _a.shouldShowProductTrainingTooltip).toBe(true);
                        // When tooltip with shouldShow=false is unmounted
                        rerender(wrapper({
                            children: (<ProductTraining ref={ref} tooltipName={testTooltip} shouldShow/>),
                        }));
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _c.sent();
                        // Then the remaining tooltip should still be shown
                        expect((_b = ref.current) === null || _b === void 0 ? void 0 : _b.shouldShowProductTrainingTooltip).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Migrated User Scenarios', function () {
        it('should not show tooltips for migrated users before welcome modal dismissal', function () { return __awaiter(void 0, void 0, void 0, function () {
            var testTooltip, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // When user is a migrated user and welcome modal is not dismissed
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { hasCompletedGuidedSetupFlow: true });
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_TRY_NEW_DOT, { nudgeMigration: { timestamp: new Date() } });
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        _a.sent();
                        testTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.BOTTOM_NAV_INBOX_TOOLTIP;
                        result = (0, react_native_1.renderHook)(function () { return (0, ProductTrainingContext_1.useProductTrainingContext)(testTooltip); }, { wrapper: wrapper }).result;
                        // Expect tooltip to be hidden
                        expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show tooltips for migrated users after welcome modal dismissal', function () { return __awaiter(void 0, void 0, void 0, function () {
            var date, testTooltip, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // When migrated user has dismissed welcome modal
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { hasCompletedGuidedSetupFlow: true });
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_TRY_NEW_DOT, { nudgeMigration: { timestamp: new Date() } });
                        date = new Date();
                        react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING, {
                            migratedUserWelcomeModal: {
                                timestamp: DateUtils_1.default.getDBTime(date.valueOf()),
                            },
                        });
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        _a.sent();
                        testTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.BOTTOM_NAV_INBOX_TOOLTIP;
                        result = (0, react_native_1.renderHook)(function () { return (0, ProductTrainingContext_1.useProductTrainingContext)(testTooltip); }, { wrapper: wrapper }).result;
                        // Then tooltip should show
                        expect(result.current.shouldShowProductTrainingTooltip).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Tooltip Dismissal', function () {
        it('should not show dismissed tooltips', function () { return __awaiter(void 0, void 0, void 0, function () {
            var date, testTooltip, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        date = new Date();
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { hasCompletedGuidedSetupFlow: true });
                        testTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP;
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING, (_a = {
                                migratedUserWelcomeModal: {
                                    timestamp: DateUtils_1.default.getDBTime(date.valueOf()),
                                }
                            },
                            _a[testTooltip] = {
                                timestamp: DateUtils_1.default.getDBTime(date.valueOf()),
                            },
                            _a));
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        _b.sent();
                        result = (0, react_native_1.renderHook)(function () { return (0, ProductTrainingContext_1.useProductTrainingContext)(testTooltip); }, { wrapper: wrapper }).result;
                        // Then tooltip should not show
                        expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should hide tooltip when hideProductTrainingTooltip is called', function () { return __awaiter(void 0, void 0, void 0, function () {
            var date, testTooltip, _a, result, rerender, dismissedTooltipsOnyxState;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // When migrated user has dismissed welcome modal
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { hasCompletedGuidedSetupFlow: true });
                        date = new Date();
                        react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING, {
                            migratedUserWelcomeModal: {
                                timestamp: DateUtils_1.default.getDBTime(date.valueOf()),
                            },
                        });
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        _b.sent();
                        testTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP;
                        _a = (0, react_native_1.renderHook)(function () { return (0, ProductTrainingContext_1.useProductTrainingContext)(testTooltip); }, { wrapper: wrapper }), result = _a.result, rerender = _a.rerender;
                        // When the user dismiss the tooltip
                        result.current.hideProductTrainingTooltip();
                        rerender({});
                        // Then tooltip should not show
                        expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING,
                                    callback: function (dismissedTooltips) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(dismissedTooltips);
                                    },
                                });
                            })];
                    case 2:
                        dismissedTooltipsOnyxState = _b.sent();
                        // Expect dismissed tooltip to be recorded
                        expect(dismissedTooltipsOnyxState).toHaveProperty(testTooltip);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Layout Specific Behavior', function () {
        it('should handle wide layout specific tooltips based on screen width', function () { return __awaiter(void 0, void 0, void 0, function () {
            var testTooltip, _a, result, rerender;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // When narrow layout is true
                        mockUseResponsiveLayout.mockReturnValue(__assign(__assign({}, DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE), { shouldUseNarrowLayout: true }));
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { hasCompletedGuidedSetupFlow: true });
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        _b.sent();
                        testTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.RENAME_SAVED_SEARCH;
                        _a = (0, react_native_1.renderHook)(function () { return (0, ProductTrainingContext_1.useProductTrainingContext)(testTooltip); }, { wrapper: wrapper }), result = _a.result, rerender = _a.rerender;
                        // Then wide layout tooltip should not show
                        expect(result.current.shouldShowProductTrainingTooltip).toBe(false);
                        // When narrow layout changes to false
                        mockUseResponsiveLayout.mockReturnValue(__assign(__assign({}, DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE), { shouldUseNarrowLayout: false }));
                        rerender({});
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _b.sent();
                        // Then wide layout tooltip should show
                        expect(result.current.shouldShowProductTrainingTooltip).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Priority Handling', function () {
        it('should show only highest priority tooltip when multiple are active', function () { return __awaiter(void 0, void 0, void 0, function () {
            var date, highPriorityTooltip, lowPriorityTooltip, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // When multiple tooltips are registered and no tooltips are dismissed
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { hasCompletedGuidedSetupFlow: true });
                        date = new Date();
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING, {
                            migratedUserWelcomeModal: {
                                timestamp: DateUtils_1.default.getDBTime(date.valueOf()),
                            },
                        });
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        _a.sent();
                        highPriorityTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP_MANAGER;
                        lowPriorityTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP;
                        result = (0, react_native_1.renderHook)(function () { return ({
                            higher: (0, ProductTrainingContext_1.useProductTrainingContext)(highPriorityTooltip),
                            lower: (0, ProductTrainingContext_1.useProductTrainingContext)(lowPriorityTooltip),
                        }); }, { wrapper: wrapper }).result;
                        // Expect only higher priority tooltip to be visible
                        expect(result.current.higher.shouldShowProductTrainingTooltip).toBe(true);
                        expect(result.current.lower.shouldShowProductTrainingTooltip).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show lower priority tooltip when higher priority is dismissed', function () { return __awaiter(void 0, void 0, void 0, function () {
            var date, highPriorityTooltip, lowPriorityTooltip, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // When higher priority tooltip is dismissed
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { hasCompletedGuidedSetupFlow: true });
                        date = new Date();
                        highPriorityTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP_MANAGER;
                        lowPriorityTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP;
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING, (_a = {
                                migratedUserWelcomeModal: {
                                    timestamp: DateUtils_1.default.getDBTime(date.valueOf()),
                                }
                            },
                            _a[highPriorityTooltip] = {
                                timestamp: DateUtils_1.default.getDBTime(date.valueOf()),
                            },
                            _a));
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        _b.sent();
                        result = (0, react_native_1.renderHook)(function () { return ({
                            higher: (0, ProductTrainingContext_1.useProductTrainingContext)(highPriorityTooltip),
                            lower: (0, ProductTrainingContext_1.useProductTrainingContext)(lowPriorityTooltip),
                        }); }, { wrapper: wrapper }).result;
                        // Expect higher priority tooltip to be hidden and lower priority to be visible
                        expect(result.current.higher.shouldShowProductTrainingTooltip).toBe(false);
                        expect(result.current.lower.shouldShowProductTrainingTooltip).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should transition to next priority tooltip when current is dismissed', function () { return __awaiter(void 0, void 0, void 0, function () {
            var date, highPriorityTooltip, lowPriorityTooltip, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // When starting with all tooltips visible
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { hasCompletedGuidedSetupFlow: true });
                        date = new Date();
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING, {
                            migratedUserWelcomeModal: {
                                timestamp: DateUtils_1.default.getDBTime(date.valueOf()),
                            },
                        });
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        _b.sent();
                        highPriorityTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP_MANAGER;
                        lowPriorityTooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP;
                        result = (0, react_native_1.renderHook)(function () { return ({
                            higher: (0, ProductTrainingContext_1.useProductTrainingContext)(highPriorityTooltip),
                            lower: (0, ProductTrainingContext_1.useProductTrainingContext)(lowPriorityTooltip),
                        }); }, { wrapper: wrapper }).result;
                        // Then initially higher priority should be visible
                        expect(result.current.higher.shouldShowProductTrainingTooltip).toBe(true);
                        expect(result.current.lower.shouldShowProductTrainingTooltip).toBe(false);
                        // When dismissing higher priority tooltip
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING, (_a = {},
                            _a[highPriorityTooltip] = {
                                timestamp: DateUtils_1.default.getDBTime(date.valueOf()),
                            },
                            _a));
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _b.sent();
                        // Then lower priority tooltip should become visible
                        expect(result.current.lower.shouldShowProductTrainingTooltip).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

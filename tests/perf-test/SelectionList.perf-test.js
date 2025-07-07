"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var reassure_1 = require("reassure");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var variables_1 = require("@styles/variables");
jest.mock('@components/Icon/Expensicons');
jest.mock('@hooks/useLocalize', function () {
    return jest.fn(function () { return ({
        translate: jest.fn(),
        numberFormat: jest.fn(),
    }); });
});
jest.mock('@hooks/useNetwork', function () {
    return jest.fn(function () { return ({
        isOffline: false,
    }); });
});
jest.mock('@components/withKeyboardState', function () { return function (Component) {
    function WrappedComponent(props) {
        return (<Component 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} isKeyboardShown={false}/>);
    }
    WrappedComponent.displayName = "WrappedComponent";
    return WrappedComponent;
}; });
jest.mock('@react-navigation/stack', function () { return ({
    useCardAnimation: function () { },
}); });
jest.mock('@react-navigation/native', function () { return ({
    useFocusEffect: function () { },
    useIsFocused: function () { return true; },
    createNavigationContainerRef: jest.fn(),
}); });
jest.mock('../../src/hooks/useKeyboardState', function () { return ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(function () { return ({
        isKeyboardShown: false,
        keyboardHeight: 0,
    }); }),
}); });
jest.mock('../../src/hooks/useScreenWrapperTransitionStatus', function () { return ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(function () { return ({
        didScreenTransitionEnd: true,
    }); }),
}); });
jest.mock('@src/components/ConfirmedRoute.tsx');
function SelectionListWrapper(_a) {
    var canSelectMultiple = _a.canSelectMultiple;
    var _b = (0, react_1.useState)([]), selectedIds = _b[0], setSelectedIds = _b[1];
    var sections = [
        {
            data: Array.from({ length: 1000 }, function (element, index) { return ({
                text: "Item ".concat(index),
                keyForList: "item-".concat(index),
                isSelected: selectedIds.includes("item-".concat(index)),
            }); }),
            isDisabled: false,
        },
    ];
    var onSelectRow = function (item) {
        if (!item.keyForList) {
            return;
        }
        if (canSelectMultiple) {
            if (selectedIds.includes(item.keyForList)) {
                setSelectedIds(selectedIds.filter(function (selectedId) { return selectedId === item.keyForList; }));
            }
            else {
                setSelectedIds(__spreadArray(__spreadArray([], selectedIds, true), [item.keyForList], false));
            }
        }
        else {
            setSelectedIds([item.keyForList]);
        }
    };
    return (<SelectionList_1.default textInputLabel="Perf test" sections={sections} onSelectRow={onSelectRow} initiallyFocusedOptionKey="item-0" ListItem={RadioListItem_1.default} canSelectMultiple={canSelectMultiple}/>);
}
test('[SelectionList] should render 1 section and a thousand items', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, reassure_1.measureRenders)(<SelectionListWrapper />)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('[SelectionList] should press a list item', function () { return __awaiter(void 0, void 0, void 0, function () {
    var scenario;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scenario = function (screen) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        react_native_1.fireEvent.press(screen.getByText('Item 5'));
                        return [2 /*return*/];
                    });
                }); };
                return [4 /*yield*/, (0, reassure_1.measureRenders)(<SelectionListWrapper />, { scenario: scenario })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('[SelectionList] should render multiple selection and select 3 items', function () { return __awaiter(void 0, void 0, void 0, function () {
    var scenario;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scenario = function (screen) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        react_native_1.fireEvent.press(screen.getByText('Item 1'));
                        react_native_1.fireEvent.press(screen.getByText('Item 2'));
                        react_native_1.fireEvent.press(screen.getByText('Item 3'));
                        return [2 /*return*/];
                    });
                }); };
                return [4 /*yield*/, (0, reassure_1.measureRenders)(<SelectionListWrapper canSelectMultiple/>, { scenario: scenario })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('[SelectionList] should scroll and select a few items', function () { return __awaiter(void 0, void 0, void 0, function () {
    var eventData, scenario;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                eventData = {
                    nativeEvent: {
                        contentOffset: {
                            y: variables_1.default.optionRowHeight * 5,
                        },
                        contentSize: {
                            // Dimensions of the scrollable content
                            height: variables_1.default.optionRowHeight * 10,
                            width: 100,
                        },
                        layoutMeasurement: {
                            // Dimensions of the device
                            height: variables_1.default.optionRowHeight * 5,
                            width: 100,
                        },
                    },
                };
                scenario = function (screen) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        react_native_1.fireEvent.press(screen.getByText('Item 1'));
                        // see https://github.com/callstack/react-native-testing-library/issues/1540
                        (0, react_native_1.fireEvent)(screen.getByTestId('selection-list'), 'onContentSizeChange', eventData.nativeEvent.contentSize.width, eventData.nativeEvent.contentSize.height);
                        react_native_1.fireEvent.scroll(screen.getByTestId('selection-list'), eventData);
                        react_native_1.fireEvent.press(screen.getByText('Item 7'));
                        react_native_1.fireEvent.press(screen.getByText('Item 15'));
                        return [2 /*return*/];
                    });
                }); };
                return [4 /*yield*/, (0, reassure_1.measureRenders)(<SelectionListWrapper canSelectMultiple/>, { scenario: scenario })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var useSyncFocusImplementation_1 = require("@hooks/useSyncFocus/useSyncFocusImplementation");
describe('useSyncFocus', function () {
    it('useSyncFocus should only focus if shouldSyncFocus is true', function () {
        var refMock = { current: { focus: jest.fn() } };
        // When useSyncFocus is rendered initially while shouldSyncFocus is false.
        var rerender = (0, react_native_1.renderHook)(function (_a) {
            var _b = _a.ref, ref = _b === void 0 ? refMock : _b, _c = _a.isFocused, isFocused = _c === void 0 ? true : _c, _d = _a.shouldSyncFocus, shouldSyncFocus = _d === void 0 ? false : _d;
            return (0, useSyncFocusImplementation_1.default)(ref, isFocused, shouldSyncFocus);
        }, { initialProps: {} }).rerender;
        // Then the ref focus will not be called.
        expect(refMock.current.focus).not.toHaveBeenCalled();
        rerender({ isFocused: false });
        expect(refMock.current.focus).not.toHaveBeenCalled();
        // When shouldSyncFocus and isFocused are true
        rerender({ isFocused: true, shouldSyncFocus: true });
        // Then the ref focus will be called.
        expect(refMock.current.focus).toHaveBeenCalled();
    });
});

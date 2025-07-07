"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useAppState(_a) {
    var _b = _a === void 0 ? {} : _a, _onAppStateChange = _b.onAppStateChange;
    // Since there's no AppState in web, we'll always return isForeground as true
    return { isForeground: true, isInactive: false, isBackground: false };
}
exports.default = useAppState;

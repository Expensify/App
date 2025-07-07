"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ImportSpreadsheet_1 = require("@libs/actions/ImportSpreadsheet");
function useCloseImportPage() {
    var isClosing = (0, react_1.useRef)(false);
    var setIsClosing = (0, react_1.useCallback)(function (value) {
        isClosing.current = value;
    }, []);
    (0, react_1.useEffect)(function () {
        return function () {
            if (!isClosing.current) {
                return;
            }
            (0, ImportSpreadsheet_1.closeImportPage)();
        };
    }, []);
    return { setIsClosing: setIsClosing };
}
exports.default = useCloseImportPage;

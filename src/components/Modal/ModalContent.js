"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function ModalContent(_a) {
    var children = _a.children, _b = _a.onDismiss, onDismiss = _b === void 0 ? function () { } : _b, _c = _a.onModalWillShow, onModalWillShow = _c === void 0 ? function () { } : _c;
    react_1.default.useEffect(function () {
        onModalWillShow();
        return onDismiss;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return children;
}
ModalContent.displayName = 'ModalContent';
exports.default = ModalContent;

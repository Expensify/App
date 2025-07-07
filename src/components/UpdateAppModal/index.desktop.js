"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ELECTRON_EVENTS_1 = require("@desktop/ELECTRON_EVENTS");
var BaseUpdateAppModal_1 = require("./BaseUpdateAppModal");
function UpdateAppModal(_a) {
    var onSubmit = _a.onSubmit;
    var updateApp = function () {
        onSubmit === null || onSubmit === void 0 ? void 0 : onSubmit();
        window.electron.send(ELECTRON_EVENTS_1.default.START_UPDATE);
    };
    return <BaseUpdateAppModal_1.default onSubmit={updateApp}/>;
}
UpdateAppModal.displayName = 'UpdateAppModal';
exports.default = UpdateAppModal;

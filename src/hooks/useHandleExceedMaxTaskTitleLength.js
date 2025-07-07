"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
var useHandleExceedMaxTaskTitleLength = function () {
    var _a = (0, react_1.useState)(false), hasExceededMaxTaskTitleLength = _a[0], setHasExceededMaxTitleLength = _a[1];
    var validateTaskTitleMaxLength = (0, react_1.useCallback)(function (title) {
        var exceeded = title ? title.length > CONST_1.default.TITLE_CHARACTER_LIMIT : false;
        setHasExceededMaxTitleLength(exceeded);
    }, []);
    return { hasExceededMaxTaskTitleLength: hasExceededMaxTaskTitleLength, validateTaskTitleMaxLength: validateTaskTitleMaxLength, setHasExceededMaxTitleLength: setHasExceededMaxTitleLength };
};
exports.default = useHandleExceedMaxTaskTitleLength;

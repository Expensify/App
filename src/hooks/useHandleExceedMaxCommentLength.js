"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ReportUtils = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var useHandleExceedMaxCommentLength = function () {
    var _a = (0, react_1.useState)(false), hasExceededMaxCommentLength = _a[0], setHasExceededMaxCommentLength = _a[1];
    var validateCommentMaxLength = (0, react_1.useCallback)(function (value, parsingDetails) {
        if (ReportUtils.getCommentLength(value, parsingDetails) <= CONST_1.default.MAX_COMMENT_LENGTH) {
            if (hasExceededMaxCommentLength) {
                setHasExceededMaxCommentLength(false);
            }
            return;
        }
        setHasExceededMaxCommentLength(true);
    }, [hasExceededMaxCommentLength]);
    return { hasExceededMaxCommentLength: hasExceededMaxCommentLength, validateCommentMaxLength: validateCommentMaxLength, setHasExceededMaxCommentLength: setHasExceededMaxCommentLength };
};
exports.default = useHandleExceedMaxCommentLength;

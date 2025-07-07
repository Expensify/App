"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Text_1 = require("./Text");
function ExceededCommentLength(_a) {
    var _b = _a.maxCommentLength, maxCommentLength = _b === void 0 ? CONST_1.default.MAX_COMMENT_LENGTH : _b, isTaskTitle = _a.isTaskTitle;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, useLocalize_1.default)(), numberFormat = _c.numberFormat, translate = _c.translate;
    var translationKey = isTaskTitle ? 'composer.taskTitleExceededMaxLength' : 'composer.commentExceededMaxLength';
    return (<Text_1.default style={[styles.textMicro, styles.textDanger, styles.chatItemComposeSecondaryRow, styles.mlAuto, styles.pl2]} numberOfLines={1}>
            {translate(translationKey, { formattedMaxLength: numberFormat(maxCommentLength) })}
        </Text_1.default>);
}
ExceededCommentLength.displayName = 'ExceededCommentLength';
exports.default = (0, react_1.memo)(ExceededCommentLength);

"use strict";
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
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Text_1 = require("./Text");
var TextLink_1 = require("./TextLink");
/*
 * This is a "utility component", that does this:
 *     - Checks if a text contains any email. If it does, render it as a mailto: link
 *     - Else just render it inside `Text` component
 */
function AutoEmailLink(_a) {
    var text = _a.text, style = _a.style;
    var styles = (0, useThemeStyles_1.default)();
    var emailRegex = expensify_common_1.CONST.REG_EXP.EXTRACT_EMAIL;
    var matches = __spreadArray([], text.matchAll(emailRegex), true);
    if (matches.length === 0) {
        return <Text_1.default style={style}>{text}</Text_1.default>;
    }
    var lastIndex = 0;
    return (<Text_1.default style={style}>
            {matches.flatMap(function (match, index) {
            var _a;
            var email = match[0];
            var startIndex = (_a = match.index) !== null && _a !== void 0 ? _a : 0;
            var elements = [];
            // Push plain text before email
            if (startIndex > lastIndex) {
                elements.push(text.slice(lastIndex, startIndex));
            }
            // Push email as a link
            elements.push(<TextLink_1.default 
            // eslint-disable-next-line react/no-array-index-key
            key={"email-".concat(index)} href={"mailto:".concat(email)} style={styles.emailLink}>
                        {email}
                    </TextLink_1.default>);
            lastIndex = startIndex + email.length;
            return elements;
        })}
            {lastIndex < text.length && text.slice(lastIndex)}
        </Text_1.default>);
}
AutoEmailLink.displayName = 'AutoEmailLink';
exports.default = AutoEmailLink;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * TextBlock component splits a given text into individual words and displays
 * each word within a Text component.
 */
var react_1 = require("react");
var Text_1 = require("./Text");
function TextBlock(_a) {
    var color = _a.color, textStyles = _a.textStyles, text = _a.text;
    var words = (0, react_1.useMemo)(function () { var _a; return (_a = text.match(/(\S+\s*)/g)) !== null && _a !== void 0 ? _a : []; }, [text]);
    return (<>
            {words.map(function (word) { return (<Text_1.default color={color} style={textStyles} key={word}>
                    {word}
                </Text_1.default>); })}
        </>);
}
TextBlock.displayName = 'TextBlock';
exports.default = (0, react_1.memo)(TextBlock);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var EmojiWithTooltip_1 = require("@components/EmojiWithTooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function EmojiRenderer(_a) {
    var tnode = _a.tnode, styleProp = _a.style;
    var styles = (0, useThemeStyles_1.default)();
    var style = (0, react_1.useMemo)(function () {
        if ('islarge' in tnode.attributes) {
            return [styleProp, styles.onlyEmojisText];
        }
        if ('ismedium' in tnode.attributes) {
            return [styleProp, styles.emojisWithTextFontSize, styles.verticalAlignTopText];
        }
        return null;
    }, [tnode.attributes, styles, styleProp]);
    return (<EmojiWithTooltip_1.default style={[style, styles.cursorDefault, styles.emojiDefaultStyles]} emojiCode={'data' in tnode ? tnode.data : ''} isMedium={'ismedium' in tnode.attributes}/>);
}
EmojiRenderer.displayName = 'EmojiRenderer';
exports.default = EmojiRenderer;

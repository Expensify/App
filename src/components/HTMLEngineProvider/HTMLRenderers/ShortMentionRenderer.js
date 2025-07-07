"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_render_html_1 = require("react-native-render-html");
var Text_1 = require("@components/Text");
var useShortMentionsList_1 = require("@hooks/useShortMentionsList");
var CONST_1 = require("@src/CONST");
var MentionHereRenderer_1 = require("./MentionHereRenderer");
var MentionUserRenderer_1 = require("./MentionUserRenderer");
function ShortMentionRenderer(props) {
    var _a = (0, useShortMentionsList_1.default)(), mentionsList = _a.mentionsList, currentUserMentions = _a.currentUserMentions;
    var mentionValue = 'data' in props.tnode ? props.tnode.data.replace(CONST_1.default.UNICODE.LTR, '') : '';
    if (currentUserMentions === null || currentUserMentions === void 0 ? void 0 : currentUserMentions.includes(mentionValue)) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <MentionHereRenderer_1.default {...props}/>;
    }
    if (mentionsList.includes(mentionValue)) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <MentionUserRenderer_1.default {...props}/>;
    }
    return (<Text_1.default style={props.style}>
            <react_native_render_html_1.TNodeChildrenRenderer tnode={props.tnode}/>
        </Text_1.default>);
}
ShortMentionRenderer.displayName = 'ShortMentionRenderer';
exports.default = ShortMentionRenderer;

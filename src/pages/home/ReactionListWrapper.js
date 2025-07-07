"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var PopoverReactionList_1 = require("./report/ReactionList/PopoverReactionList");
var ReportScreenContext_1 = require("./ReportScreenContext");
function ReactionListWrapper(_a) {
    var children = _a.children;
    var reactionListRef = (0, react_1.useRef)(null);
    return (<ReportScreenContext_1.ReactionListContext.Provider value={reactionListRef}>
            {children}
            <PopoverReactionList_1.default ref={reactionListRef}/>
        </ReportScreenContext_1.ReactionListContext.Provider>);
}
exports.default = ReactionListWrapper;

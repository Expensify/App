"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionListContext = exports.ActionListContext = void 0;
var react_1 = require("react");
var ActionListContext = (0, react_1.createContext)({ flatListRef: null, scrollPosition: null, setScrollPosition: function () { } });
exports.ActionListContext = ActionListContext;
var ReactionListContext = (0, react_1.createContext)(null);
exports.ReactionListContext = ReactionListContext;

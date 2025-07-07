"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compactContentContainerStyles = void 0;
/**
 *  On native platforms, alignItemsBaseline does not work correctly
 *  in lining the items together. As such, on native platform, we're
 *  keeping compactContentContainerStyles as it is.
 *  https://github.com/Expensify/App/issues/14148
 */
var compactContentContainerStyles = function (styles) { return styles.alignItemsCenter; };
exports.compactContentContainerStyles = compactContentContainerStyles;

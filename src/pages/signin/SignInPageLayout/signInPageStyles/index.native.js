"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Using flexGrow on mobile allows the ScrollView container to grow to fit the content.
// This is necessary because making the sign-in content fit exactly the view height causes the scroll to stop working on mobile.
var scrollViewContentContainerStyles = function (styles) { return styles.flexGrow1; };
exports.default = scrollViewContentContainerStyles;

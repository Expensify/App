"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SearchAutocompleteInput_1 = require("@components/Search/SearchAutocompleteInput");
function SearchInputSelectionWrapper(_a, ref) {
    var selection = _a.selection, props = __rest(_a, ["selection"]);
    return (<SearchAutocompleteInput_1.default selection={selection} ref={ref} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
SearchInputSelectionWrapper.displayName = 'SearchInputSelectionWrapper';
exports.default = (0, react_1.forwardRef)(SearchInputSelectionWrapper);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SearchAutocompleteInput_1 = require("@components/Search/SearchAutocompleteInput");
function SearchInputSelectionWrapper(props, ref) {
    return (<SearchAutocompleteInput_1.default ref={ref} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} selection={undefined}/>);
}
SearchInputSelectionWrapper.displayName = 'SearchInputSelectionWrapper';
exports.default = (0, react_1.forwardRef)(SearchInputSelectionWrapper);

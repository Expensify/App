'use strict';
exports.__esModule = true;
var react_1 = require('react');
/**
 * A hook that returns the previous value of a variable
 */
function usePrevious(value) {
    var ref = react_1.useRef(value);
    react_1.useEffect(
        function () {
            ref.current = value;
        },
        [value],
    );
    // eslint-disable-next-line react-compiler/react-compiler
    return ref.current;
}
exports['default'] = usePrevious;

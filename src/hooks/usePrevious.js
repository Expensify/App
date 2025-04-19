
exports.__esModule = true;
const react_1 = require('react');
/**
 * A hook that returns the previous value of a variable
 */
function usePrevious(value) {
    const ref = react_1.useRef(value);
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

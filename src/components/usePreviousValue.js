import React from 'react';

function usePreviousValue(value) {
    const previousValueRef = React.useRef();

    React.useEffect(() => {
        previousValueRef.current = value;
    }, [value]);

    return previousValueRef.current;
}

export default usePreviousValue;

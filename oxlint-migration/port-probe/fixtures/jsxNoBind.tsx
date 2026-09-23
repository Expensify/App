import React from 'react';

function Inner(props: {onPress: () => void}) {
    return <span onClick={props.onPress} />;
}

// react/jsx-no-bind: function expressions are not allowed (allowFunctions: false),
// and Inner is not a DOM component so ignoreDOMComponents does not apply
function Outer() {
    return (
        <Inner
            onPress={function handle() {
                return undefined;
            }}
        />
    );
}

export default Outer;

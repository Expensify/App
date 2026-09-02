// Fixture for react/prefer-exact-props, which needs a file of its own for an upstream reason:
// its MemberExpression handler reads `node.parent.right` for every `*.propTypes` it sees, so a
// *read* of someone else's propTypes (`const borrowed = React.Fragment.propTypes`, which
// reactPropTypes.tsx needs for forbid-foreign-prop-types) makes it throw
// "Cannot read properties of undefined (reading 'type')" and takes the whole ESLint run down.
// The repo never hits that, because its propWrapperFunctions declare no exact wrapper and the rule
// returns early. Both fixture configs do declare one, so the crashing shape has to stay out.
import PropTypes from 'prop-types';
import React from 'react';

function ExactPropsCandidate({label}) {
    return <div>{label}</div>;
}

// prefer-exact-props: a plain object literal, not the exact() wrapper the fixture settings declare
ExactPropsCandidate.propTypes = {
    label: PropTypes.string,
};

export default ExactPropsCandidate;

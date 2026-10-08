// Fixture for the eslint-plugin-react PropTypes rules. Deliberately written in the style the repo
// left behind: PropTypes statics on a function component, plus one class-property typo.
import PropTypes from 'prop-types';
import React from 'react';

// forbid-foreign-prop-types: reading another component's propTypes
const borrowed = React.Fragment.propTypes;

function PropTypesComponent({usedProp}) {
    return <div>{usedProp}</div>;
}

// prefer-exact-props: a plain object literal instead of an exact() wrapper
PropTypesComponent.propTypes = {
    usedProp: PropTypes.string,
    unusedProp: PropTypes.string, // no-unused-prop-types: declared, never read
    looseProp: PropTypes.any, // forbid-prop-types: any/array/object are forbidden
};

PropTypesComponent.defaultProps = {
    absentFromPropTypes: 'default', // default-props-match-prop-types: no matching propType
};

// no-typos: the static is `propTypes`, not `PropTypes`
class TypoStatics extends React.Component {
    static PropTypes = {};

    render() {
        return null;
    }
}

export {borrowed, PropTypesComponent, TypoStatics};

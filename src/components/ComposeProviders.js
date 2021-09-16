import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    /** Provider components go here */
    components: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.func])).isRequired,

    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

const ComposeProviders = props => (
    <>
        {props.components.reduceRight((memo, Component) => (
            <Component>{memo}</Component>
        ), props.children)}
    </>
);

ComposeProviders.propTypes = propTypes;
ComposeProviders.displayName = 'ComposeProviders';
export default ComposeProviders;

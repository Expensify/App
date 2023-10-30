import PropTypes from 'prop-types';
import React from 'react';
import CollapsibleRN from 'react-native-collapsible';

const propTypes = {
    /** Whether the section should start expanded. False by default */
    isOpened: PropTypes.bool,

    /** Children to display inside the Collapsible component */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    isOpened: false,
};

function Collapsible(props) {
    return <CollapsibleRN collapsed={!props.isOpened}>{props.children}</CollapsibleRN>;
}

Collapsible.displayName = 'Collapsible';
Collapsible.propTypes = propTypes;
Collapsible.defaultProps = defaultProps;
export default Collapsible;

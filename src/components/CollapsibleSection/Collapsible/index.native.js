import CollapsibleRN from 'react-native-collapsible';
import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    /** Whether the section should start expanded. False by default */
    isOpened: PropTypes.bool,

    /** Children to display inside the Collapsible component */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    isOpened: false,
};

const Collapsible = props => (
    <CollapsibleRN collapsed={!props.isOpened}>
        {props.children}
    </CollapsibleRN>
);

Collapsible.displayName = 'Collapsible';
Collapsible.propTypes = propTypes;
Collapsible.defaultProps = defaultProps;
export default Collapsible;

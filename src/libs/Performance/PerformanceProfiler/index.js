import React from 'react';
import PropTypes from 'prop-types';

const DummyComponent = props => <>{props.children}</>;
DummyComponent.propTypes = {
    children: PropTypes.node.isRequired,
};
DummyComponent.displayName = 'PerformanceProfiler';
export default DummyComponent;

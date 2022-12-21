import PropTypes from 'prop-types';
import {PureComponent} from 'react';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,
};

class DeeplinkWrapper extends PureComponent {
    render() {
        return this.props.children;
    }
}

DeeplinkWrapper.propTypes = propTypes;
export default DeeplinkWrapper;

import React from 'react';
import {TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';

const defaultPropTypes = {
    styles: [],
};

const propTypes = {

    /** Child node that should be touchable  */
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]).isRequired,

    /** Callback for onPress event */
    onPress: PropTypes.func.isRequired,

    /** Styles that should be passed to touchable container */
    styles: PropTypes.arrayOf(PropTypes.object),
};


/**
 *
 * @param {Object} props
 * @returns {React.Component}
 */
class TouchableWithoutFocus extends React.Component {
    constructor() {
        super();
        this.onPress = this.onPress.bind(this);
    }

    onPress() {
        if (!this.props.onPress) {
            return;
        }
        this.props.onPress();
        this.inputRef.blur();
    }

    render() {
        return (
            <TouchableOpacity onPress={this.onPress} ref={e => this.inputRef = e} style={this.props.styles}>
                {this.props.children}
            </TouchableOpacity>
        );
    }
}

TouchableWithoutFocus.propTypes = propTypes;
TouchableWithoutFocus.defaultProps = defaultPropTypes;
TouchableWithoutFocus.displayName = 'TouchableWithoutFocus';

export default TouchableWithoutFocus;

import React, {Component} from 'react';
import {
    // eslint-disable-next-line no-restricted-imports
    TextInput as RNTextInput,
} from 'react-native';
import PropTypes from 'prop-types';


const propTypes = {
    ref: PropTypes.func,
};

const defaultProps = {
    ref: undefined,
};

class BaseTextInput extends Component {
    render() {
        return (
            <RNTextInput
                // eslint-disable-next-line rulesdir/prefer-early-return
                ref={(ref) => {
                    if (typeof this.props.ref === 'function') {
                        this.props.ref(ref);
                    }
                }}

                // By default, align input to the left to override right alignment in RTL mode which is not yet supported in the App.
                // eslint-disable-next-line react/jsx-props-no-multi-spaces
                textAlign="left"

                // eslint-disable-next-line
                {...this.props}
            />
        );
    }
}

BaseTextInput.propTypes = propTypes;
BaseTextInput.defaultProps = defaultProps;

export default BaseTextInput;

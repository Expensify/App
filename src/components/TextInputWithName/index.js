import _ from 'underscore';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {TextInput} from 'react-native';
import textInputWithNamepropTypes from './textInputWithNamepropTypes';

/**
 * On web we need to set the native attribute name for accessiblity.
 */
class TextInputWithName extends React.Component {
    componentDidMount() {
        if (!this.textInput) {
            return;
        }
        if (_.isFunction(this.props.forwardedRef)) {
            this.props.forwardedRef(this.textInput);
        }

        if (this.props.name) {
            this.textInput.setNativeProps({name: this.props.name});
        }
    }

    render() {
        return (
            <TextInput
                ref={el => this.textInput = el}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}

TextInputWithName.propTypes = textInputWithNamepropTypes.propTypes;
TextInputWithName.defaultProps = textInputWithNamepropTypes.defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInputWithName {...props} forwardedRef={ref} />
));

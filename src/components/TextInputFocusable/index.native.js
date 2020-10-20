import React from 'react';
import {TextInput} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    // A ref to forward to the text input
    forwardedRef: PropTypes.func.isRequired,
};

/**
 * On native layers we like to have the Text Input not focused so the user can read new chats without they keyboard in
 * the way of the view
 */
class TextInputFocusable extends React.Component {
    constructor(props) {
        super(props);

        this.clearContents = this.clearContents.bind(this);
    }

    clearContents() {
        this.textInput.clear();
    }

    render() {
        return (
            <TextInput
                ref={el => this.textInput = el}
                maxHeight={116}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...this.props}
            />
        );
    }
}

TextInputFocusable.displayName = 'TextInputFocusable';
TextInputFocusable.propTypes = propTypes;
export default TextInputFocusable;

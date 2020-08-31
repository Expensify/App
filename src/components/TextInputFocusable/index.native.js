import React from 'react';
import {TextInput} from 'react-native';

/**
 * On native layers we like to have the Text Input not focused so the user can read new chats without they keyboard in
 * the way of the view
 */
class TextInputFocusable extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'TextInputFocusable';
    }

    clearLines() {}

    render() {
        return (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <TextInput {...this.props} />
        );
    }
}

export default TextInputFocusable;

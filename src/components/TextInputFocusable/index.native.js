import React from 'react';
import {TextInput} from 'react-native';

/**
 * On native layers we like to have the Text Input not focused so the user can read new chats without they keyboard in
 * the way of the view
 */
class TextInputFocusable extends React.Component {
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
export default TextInputFocusable;

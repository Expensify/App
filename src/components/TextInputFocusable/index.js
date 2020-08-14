import React from 'react';
import {TextInput} from 'react-native';

/**
 * On web we like to have the Text Input field always focused so the user can easily type a new chat
 */
class TextInputFocusable extends React.Component {
    componentDidMount() {
        this.focusInput();
    }

    componentDidUpdate() {
        this.focusInput();
    }

    focusInput() {
        this.textInput.focus();
    }

    render() {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <TextInput ref={el => this.textInput = el} {...this.props} />;
    }
}

export default TextInputFocusable;

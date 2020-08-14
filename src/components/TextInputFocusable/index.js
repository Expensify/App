import React from 'react';
import {TextInput} from 'react-native';

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

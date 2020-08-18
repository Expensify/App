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
        const scrollHeight = this.state && this.state.height ? this.state.height : 40;
        return (
            <TextInput
                ref={el => this.textInput = el}
                onChange={(event) => {
                    // eslint-disable-next-line react/no-unused-state
                    this.setState({height: event.nativeEvent.srcElement.scrollHeight});
                }}
                minHeight={scrollHeight}
                style={[...this.props.style, {minHeight: scrollHeight}]}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...this.props}
                container
            />
        );
    }
}

export default TextInputFocusable;

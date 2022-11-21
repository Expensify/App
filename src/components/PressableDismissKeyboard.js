import React from 'react';
import {TouchableWithoutFeedback, Keyboard} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.node.isRequired,
};

class PressableDismissKeyboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isKeyboardShowing: false,
        };

        this.dismissKeyboardIfOpen = this.dismissKeyboardIfOpen.bind(this);
    }

    componentDidMount() {
        Keyboard.addListener('keyboardDidShow', () => this.setState({isKeyboardShowing: true}));
        Keyboard.addListener('keyboardDidHide', () => this.setState({isKeyboardShowing: false}));
    }

    componentWillUnmount() {
        Keyboard.removeAllListeners('keyboardDidShow');
        Keyboard.removeAllListeners('keyboardDidHide');
    }

    dismissKeyboardIfOpen() {
        if (!this.state.isKeyboardShowing) {
            return;
        }
        Keyboard.dismiss();
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={this.dismissKeyboardIfOpen}>
                {this.props.children}
            </TouchableWithoutFeedback>
        );
    }
}

PressableDismissKeyboard.propTypes = propTypes;

export default PressableDismissKeyboard;

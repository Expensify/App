import React from 'react';
import {Dimensions} from 'react-native';
import variables from '../../../styles/variables';
import LoginFormNarrow from './LoginFormNarrow';
import LoginFormWide from './LoginFormWide';

class LoginForm extends React.Component {
    constructor(props) {
        super(props);

        this.toggleScreenWidth = this.toggleScreenWidth.bind(this);

        this.state = {
            isWideScreen: false,
        };
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.toggleScreenWidth);
        this.toggleScreenWidth({window: Dimensions.get('window')});
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.toggleScreenWidth);
    }

    /**
     * Fired when the windows dimensions changes
     * @param {Object} changedWindow
     */
    toggleScreenWidth({window: changedWindow}) {
        this.setState({
            isWideScreen: changedWindow.width > variables.mobileResponsiveWidthBreakpoint,
        });
    }

    render() {
        return (
            <>
                {this.state.isWideScreen ? <LoginFormWide /> : <LoginFormNarrow />}
            </>
        );
    }
}

export default LoginForm;

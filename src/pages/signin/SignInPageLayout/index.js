import React from 'react';
import {Dimensions} from 'react-native';
import _ from 'underscore';
import variables from '../../../styles/variables';
import SignInPageLayoutNarrow from './SignInPageLayoutNarrow';
import SignInPageLayoutWide from './SignInPageLayoutWide';

class LoginForm extends React.Component {
    constructor(props) {
        super(props);

        this.toggleScreenWidth = _.debounce(this.toggleScreenWidth.bind(this), 1000, true);

        this.state = {
            isWideScreen: null,
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
        if (this.state.isWideScreen === null) {
            return null;
        }

        return this.state.isWideScreen
            // eslint-disable-next-line react/jsx-props-no-spreading
            ? <SignInPageLayoutWide {...this.props} />
            // eslint-disable-next-line react/jsx-props-no-spreading
            : <SignInPageLayoutNarrow {...this.props} />;
    }
}

export default LoginForm;

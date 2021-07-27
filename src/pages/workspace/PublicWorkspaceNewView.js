import React from 'react';
import PropTypes from 'prop-types';
import SCREENS from '../../SCREENS';
import {setRedirectToWorkspaceNewAfterSignIn} from '../../libs/actions/Session';

const propTypes = {
    /** react-navigation navigation object available to screen components */
    navigation: PropTypes.shape({
        /** Method used to navigate to a new page and not keep the current route in the history */
        replace: PropTypes.func.isRequired,
    }).isRequired,
};

class PublicWorkspaceNewView extends React.PureComponent {
    componentDidMount() {
        setRedirectToWorkspaceNewAfterSignIn(true);
        this.props.navigation.replace(SCREENS.HOME);
    }

    render() {
        return null;
    }
}

PublicWorkspaceNewView.propTypes = propTypes;

export default PublicWorkspaceNewView;

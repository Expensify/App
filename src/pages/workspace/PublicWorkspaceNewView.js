import Onyx from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../../ONYXKEYS';
import SCREENS from '../../SCREENS';

const propTypes = {
    /** react-navigation navigation object available to screen components */
    navigation: PropTypes.shape({
        /** Method used to navigate to a new page and not keep the current route in the history */
        replace: PropTypes.func.isRequired,
    }).isRequired,
};

const PublicWorkspaceNewView = (props) => {
    Onyx.merge(ONYXKEYS.SESSION, {redirectToWorkspaceNewAfterSignIn: true});

    props.navigation.replace(SCREENS.HOME);

    return null;
};

PublicWorkspaceNewView.propTypes = propTypes;
PublicWorkspaceNewView.displayName = 'PublicWorkspaceNewView';
export default PublicWorkspaceNewView;

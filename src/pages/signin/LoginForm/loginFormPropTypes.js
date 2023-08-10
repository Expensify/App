import PropTypes from 'prop-types';
import networkPropTypes from '../../../components/networkPropTypes';
import {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import {withLocalizePropTypes} from '../../../components/withLocalize';
import {toggleVisibilityViewPropTypes} from '../../../components/withToggleVisibilityView';
import {withNavigationFocusPropTypes} from '../../../components/withNavigationFocus';

const propTypes = {
    /** Should we dismiss the keyboard when transitioning away from the page? */
    blurOnSubmit: PropTypes.bool,

    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** An error message to display to the user */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Success message to display when necessary */
        success: PropTypes.string,

        /** Whether or not a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

    closeAccount: PropTypes.shape({
        /** Message to display when user successfully closed their account */
        success: PropTypes.string,
    }),

    /** Props to detect online status */
    network: networkPropTypes.isRequired,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    ...toggleVisibilityViewPropTypes,

    ...withNavigationFocusPropTypes,
};

const defaultProps = {
    account: {},
    closeAccount: {},
    blurOnSubmit: false,
};

export {propTypes, defaultProps};

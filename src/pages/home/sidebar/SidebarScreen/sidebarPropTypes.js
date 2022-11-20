import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import {withLocalizePropTypes} from '../../../../components/withLocalize';

const sidebarPropTypes = {

    /** The list of policies the user has access to. */
    allPolicies: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,
    }),

    /* Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const sidebarDefaultProps = {
    allPolicies: {},
    betas: [],
};

export {sidebarPropTypes, sidebarDefaultProps};

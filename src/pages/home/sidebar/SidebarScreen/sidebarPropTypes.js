import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import {withLocalizePropTypes} from '../../../../components/withLocalize';

const propTypes = {
    /* Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /* Is workspace is being created by the user? */
    isCreatingWorkspace: PropTypes.bool,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

export default propTypes;

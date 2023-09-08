import PropTypes from 'prop-types';
import tagPropTypes from '../tagPropTypes';
import {iouPropTypes, iouDefaultProps} from '../../pages/iou/propTypes';

const propTypes = {
    /** The report ID of the IOU */
    reportID: PropTypes.string.isRequired,

    /** The policyID we are getting tags for */
    policyID: PropTypes.string.isRequired,

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.string.isRequired,

    /** Callback to submit the selected tag */
    onSubmit: PropTypes.func,

    /* Onyx Props */
    /** Collection of tags attached to a policy */
    policyTags: PropTypes.objectOf(tagPropTypes),

    /* Onyx Props */
    /** List of recently used tags */
    policyRecentlyUsedTags: PropTypes.arrayOf(PropTypes.string),

    /* Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,
};

const defaultProps = {
    policyID: '',
    policyTags: {},
    policyRecentlyUsedTags: [],
    iou: iouDefaultProps,
};

export {propTypes, defaultProps};

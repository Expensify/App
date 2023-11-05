import PropTypes from 'prop-types';
import tagPropTypes from '@components/tagPropTypes';

const propTypes = {
    /** The policyID we are getting tags for */
    policyID: PropTypes.string.isRequired,

    /** The selected tag of the money request */
    selectedTag: PropTypes.string.isRequired,

    /** The name of tag list we are getting tags for */
    tag: PropTypes.string.isRequired,

    /** Callback to submit the selected tag */
    onSubmit: PropTypes.func.isRequired,

    /* Onyx Props */
    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,

    /** List of recently used tags */
    policyRecentlyUsedTags: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
};

const defaultProps = {
    policyTags: {},
    policyRecentlyUsedTags: {},
};

export {propTypes, defaultProps};

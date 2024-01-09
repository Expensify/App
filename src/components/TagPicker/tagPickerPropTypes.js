import PropTypes from 'prop-types';
import tagPropTypes from '@components/tagPropTypes';
import safeAreaInsetPropTypes from '@pages/safeAreaInsetPropTypes';

const propTypes = {
    /** The policyID we are getting tags for */
    policyID: PropTypes.string.isRequired,

    /** The selected tag of the money request */
    selectedTag: PropTypes.string.isRequired,

    /** The name of tag list we are getting tags for */
    tag: PropTypes.string.isRequired,

    /** Callback to submit the selected tag */
    onSubmit: PropTypes.func.isRequired,

    /**
     * Safe area insets required for reflecting the portion of the view,
     * that is not covered by navigation bars, tab bars, toolbars, and other ancestor views.
     */
    insets: safeAreaInsetPropTypes.isRequired,

    /* Onyx Props */
    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,

    /** List of recently used tags */
    policyRecentlyUsedTags: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),

    /** Should show the selected option that is disabled? */
    shouldShowDisabledAndSelectedOption: PropTypes.bool,
};

const defaultProps = {
    policyTags: {},
    policyRecentlyUsedTags: {},
    shouldShowDisabledAndSelectedOption: false,
};

export {propTypes, defaultProps};

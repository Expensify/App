import PropTypes from 'prop-types';

const tagListPropTypes = PropTypes.shape({
    /** Name of a tag */
    name: PropTypes.string.isRequired,

    /** Flag that determines if a tag is active and able to be selected */
    enabled: PropTypes.bool.isRequired,

    /** "General Ledger code" that corresponds to this tag in an accounting system. Similar to an ID. */
    'GL Code': PropTypes.string,
});

export default PropTypes.objectOf(
    PropTypes.shape({
        name: PropTypes.string,
        required: PropTypes.bool,
        tags: PropTypes.objectOf(tagListPropTypes),
    }),
);

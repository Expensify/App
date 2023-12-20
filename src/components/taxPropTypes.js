import PropTypes from 'prop-types';

const taxPropTypes = PropTypes.shape({
    /** Name of a tax */
    name: PropTypes.string.isRequired,

    /** The value of a tax */
    value: PropTypes.string.isRequired,

    /** Whether the tax is disabled */
    isDisabled: PropTypes.bool,
});

export default PropTypes.shape({
    /** Name of the tax */
    name: PropTypes.string.isRequired,

    /** Default policy tax ID */
    defaultExternalID: PropTypes.string,

    /** Default value of taxes */
    defaultValue: PropTypes.string,

    /** Default foreign policy tax ID */
    foreignTaxDefault: PropTypes.string,

    /** List of Taxes names and values */
    taxes: PropTypes.objectOf(taxPropTypes),
});

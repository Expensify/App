import PropTypes from 'prop-types';

const taxPropTypes = PropTypes.shape({
    /** Name of a tax */
    name: PropTypes.string.isRequired,

    /** value of a tax */
    value: PropTypes.string.isRequired,

    /** if tax is disabled */
    isDisabled: PropTypes.bool,
});

export default PropTypes.shape({
    /** Defualt name of taxes */
    name: PropTypes.string.isRequired,

    /** Defualt external ID of taxes */
    defaultExternalID: PropTypes.string,

    /** Default value of taxes */
    defaultValue: PropTypes.string,

    /** Default Foreign Tax ID */
    foreignTaxDefault: PropTypes.string,

    /** List of Taxes names and values */
    taxes: PropTypes.objectOf(taxPropTypes),
});

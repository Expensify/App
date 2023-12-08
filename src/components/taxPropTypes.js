import PropTypes from 'prop-types';

const taxPropTypes = PropTypes.shape({
    /** Name of a tax */
    name: PropTypes.string.isRequired,

     /** value of a tax */
     value: PropTypes.string.isRequired,
});

export default PropTypes.objectOf(
    PropTypes.shape({
        /** Defualt name of taxes */
        name: PropTypes.string.isRequired,

        /** Defualt external ID of taxes */
        defaultExternalID: PropTypes.string.isRequired,

         /** Default value of taxes */
        defaultValue: PropTypes.string.isRequired,

        /** Default Foreign Tax ID */
        foreignTaxDefault: PropTypes.string.isRequired,

        /** List of Taxes names and values */
        taxes: PropTypes.objectOf(taxPropTypes),
    }),
);

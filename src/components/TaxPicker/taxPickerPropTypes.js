import PropTypes from 'prop-types';
import taxPropTypes from '@components/taxPropTypes';

const propTypes = {
    /** The selected tax rate of an expense */
    selectedTaxRate: PropTypes.string,

    /** Callback to fire when a tax is pressed */
    onSubmit: PropTypes.func.isRequired,

    policy: PropTypes.shape({
        /** Collection of tax rates attached to a policy */
        taxRates: taxPropTypes,
    }),

    /**
     * Safe area insets required for reflecting the portion of the view,
     * that is not covered by navigation bars, tab bars, toolbars, and other ancestor views.
     */
    insets: safeAreaInsetPropTypes.isRequired,
};

const defaultProps = {
    selectedTaxRate: '',
    policy: {},
};

export {propTypes, defaultProps};

import PropTypes from 'prop-types';

const dataPropTypes = PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    code: PropTypes.string,
});

const taxRatePropTypes = PropTypes.shape({
    text: PropTypes.string.isRequired,
    keyForList: PropTypes.string.isRequired,
    searchText: PropTypes.string.isRequired,
    tooltipText: PropTypes.string.isRequired,
    isDisabled: PropTypes.bool,
    data: dataPropTypes,
});

const transactionsDraftPropTypes = PropTypes.shape({
    taxRate: taxRatePropTypes,
    taxAmount: PropTypes.number,
});

const taxRateDefaultProps = {
    text: '',
    keyForList: '',
    searchText: '',
    tooltipText: '',
    isDisabled: false,
    data: {},
};

const transactionsDraftDefaultProps = {
    taxRate: taxRateDefaultProps,
    taxAmount: 0,
};

export {transactionsDraftPropTypes, transactionsDraftDefaultProps};

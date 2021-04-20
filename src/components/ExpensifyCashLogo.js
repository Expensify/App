import React from 'react';
import PropTypes from 'prop-types';
import ProductionLogo from '../../assets/images/expensify-cash-dev.svg';

const propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

const ExpensifyCashLogo = props => (
    <ProductionLogo width={props.width} height={props.height} />
);

ExpensifyCashLogo.propTypes = propTypes;
ExpensifyCashLogo.displayName = 'ExpensifyCashLogo';

export default ExpensifyCashLogo;

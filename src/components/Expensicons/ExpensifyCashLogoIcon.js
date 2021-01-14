import React, {memo} from 'react';
import PropTypes from 'prop-types';
import ExpensifyCashLogoSVG from '../../../assets/images/expensify-cash.svg';
import variables from '../../styles/variables';

const propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
};

const defaultProps = {
    height: variables.componentSizeNormal,
    width: variables.componentSizeNormal,
};

const ExpensifyCashLogoIcon = props => (
    <ExpensifyCashLogoSVG
        height={props.height}
        width={props.width}
    />
);

ExpensifyCashLogoIcon.propTypes = propTypes;
ExpensifyCashLogoIcon.defaultProps = defaultProps;

export default memo(ExpensifyCashLogoIcon);

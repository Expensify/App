import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ProductionLogo from '../../assets/images/expensify-cash.svg';
import DevLogo from '../../assets/images/expensify-cash-dev.svg';
import StagingLogo from '../../assets/images/expensify-cash-stg.svg';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    environment: PropTypes.string,
};

const defaultProps = {
    environment: CONST.ENVIRONMENT.PRODUCTION,
};

const ExpensifyCashLogo = (props) => {
    switch (props.environment) {
        case CONST.ENVIRONMENT.PRODUCTION:
            return <ProductionLogo width={props.width} height={props.height} />;
        case CONST.ENVIRONMENT.STAGING:
            return <StagingLogo width={props.width} height={props.height} />;
        default:
            return <DevLogo width={props.width} height={props.height} />;
    }
};

ExpensifyCashLogo.propTypes = propTypes;
ExpensifyCashLogo.displayName = 'ExpensifyCashLogo';
ExpensifyCashLogo.defaultProps = defaultProps;

export default withOnyx({
    environment: {
        key: ONYXKEYS.ENVIRONMENT,
    },
})(ExpensifyCashLogo);

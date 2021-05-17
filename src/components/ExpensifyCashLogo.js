import React from 'react';
import PropTypes from 'prop-types';
import ProductionLogo from '../../assets/images/expensify-cash.svg';
import DevLogo from '../../assets/images/expensify-cash-dev.svg';
import StagingLogo from '../../assets/images/expensify-cash-stg.svg';
import CONST from '../CONST';
import withEnvironment, {environmentPropTypes} from './withEnvironment';

const propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    ...environmentPropTypes,
};

class ExpensifyCashLogo extends React.Component {
    render() {
        switch (this.props.environment) {
            case CONST.ENVIRONMENT.PRODUCTION:
                return <ProductionLogo width={this.props.width} height={this.props.height} />;
            case CONST.ENVIRONMENT.STAGING:
                return <StagingLogo width={this.props.width} height={this.props.height} />;
            default:
                return <DevLogo width={this.props.width} height={this.props.height} />;
        }
    }
}

ExpensifyCashLogo.propTypes = propTypes;
export default withEnvironment(ExpensifyCashLogo);

import React from 'react';
import PropTypes from 'prop-types';
import ProductionLogo from '../../assets/images/new-expensify.svg';
import DevLogo from '../../assets/images/new-expensify-dev.svg';
import StagingLogo from '../../assets/images/new-expensify-stg.svg';
import AdhocLogo from '../../assets/images/new-expensify-adhoc.svg';
import CONST from '../CONST';
import useEnvironment from '../hooks/useEnvironment';

const propTypes = {
    /** Width of logo */
    width: PropTypes.number.isRequired,

    /** Height of logo */
    height: PropTypes.number.isRequired,
};

const logoComponents = {
    [CONST.ENVIRONMENT.DEV]: DevLogo,
    [CONST.ENVIRONMENT.STAGING]: StagingLogo,
    [CONST.ENVIRONMENT.PRODUCTION]: ProductionLogo,
    [CONST.ENVIRONMENT.ADHOC]: AdhocLogo,
};

function ExpensifyCashLogo(props) {
    const {environment} = useEnvironment();

    // PascalCase is required for React components, so capitalize the const here
    const LogoComponent = logoComponents[environment];
    return (
        <LogoComponent
            width={props.width}
            height={props.height}
        />
    );
}

ExpensifyCashLogo.displayName = 'ExpensifyCashLogo';
ExpensifyCashLogo.propTypes = propTypes;
export default ExpensifyCashLogo;

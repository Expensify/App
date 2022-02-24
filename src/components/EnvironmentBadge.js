import React from 'react';
import CONST from '../CONST';
import withEnvironment, {environmentPropTypes} from './withEnvironment';
import Badge from './Badge';

const ENVIRONMENT_SHORT_FORM = {
    [CONST.ENVIRONMENT.DEV]: 'DEV',
    [CONST.ENVIRONMENT.STAGING]: 'STG',
    [CONST.ENVIRONMENT.PRODUCTION]: 'PROD',
};

const EnvironmentBadge = (props) => {
    // If we are on production, don't show any badge
    if (props.environment === CONST.ENVIRONMENT.PRODUCTION) {
        return null;
    }

    return (
        <Badge
            success={props.environment === CONST.ENVIRONMENT.STAGING}
            error={props.environment !== CONST.ENVIRONMENT.STAGING}
            text={ENVIRONMENT_SHORT_FORM[props.environment]}
        />
    );
};

EnvironmentBadge.displayName = 'EnvironmentBadge';
EnvironmentBadge.propTypes = environmentPropTypes;
export default withEnvironment(EnvironmentBadge);
